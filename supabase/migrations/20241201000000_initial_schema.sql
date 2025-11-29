-- Property Passport UK v7.0 - Initial Schema (MVP core tables, no RLS yet)
-- Source of truth: /docs/PPUK_V7_COMPLETE_BLUEPRINT*.md, /docs/core.md, /docs/security.md, /docs/user-roles.md, /docs/refresh.md
-- Notes:
-- - Use UUID PKs via gen_random_uuid()
-- - Use text enums (no PG ENUMs) with CHECK constraints
-- - Include created_at/updated_at on every table; soft-delete fields where appropriate
-- - Enforce foreign keys with ON DELETE CASCADE
-- - RLS policies are NOT included here (require explicit approval)
-- - No seed data; seed.sql will be handled separately

-- Ensure required extension for UUID generation
create extension if not exists "pgcrypto";

-- Table: properties (UPRN-centric anchor for passports)
create table if not exists public.properties (
    id uuid primary key default gen_random_uuid(),
    uprn text not null unique,
    display_address text not null,
    latitude numeric(10,7),
    longitude numeric(10,7),
    status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
    created_by_user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    -- Notes: UPRN anchors all property data. Status tracks lifecycle of the passport.
    -- Use deleted_at for soft deletion while preserving history.
    -- Coordinates optional; prefer authoritative sources when available.
    -- created_by_user_id ties to the user who registered the property in the passport system.
    constraint properties_display_address_not_empty check (length(trim(display_address)) > 0)
);
comment on table public.properties is 'Core property record anchored by UPRN.';

-- Table: property_documents (stored in property-documents bucket via signed URLs)
create table if not exists public.property_documents (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties(id) on delete cascade,
    uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    document_type text not null default 'other' check (document_type in ('title', 'survey', 'search', 'identity', 'contract', 'warranty', 'planning', 'compliance', 'other')),
    storage_bucket text not null default 'property-documents',
    storage_path text not null,
    mime_type text not null,
    size_bytes bigint not null check (size_bytes >= 0),
    version int not null default 1 check (version >= 1),
    checksum text,
    status text not null default 'active' check (status in ('active', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint property_documents_title_not_empty check (length(trim(title)) > 0),
    constraint property_documents_storage_path_not_empty check (length(trim(storage_path)) > 0)
);
comment on table public.property_documents is 'Metadata for property documents stored in Supabase Storage (property-documents bucket).';

-- Table: property_media (stored in property-photos bucket via signed URLs)
create table if not exists public.property_media (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties(id) on delete cascade,
    uploaded_by_user_id uuid not null references auth.users(id) on delete cascade,
    media_type text not null default 'photo' check (media_type in ('photo', 'video', 'floorplan', 'other')),
    title text not null,
    storage_bucket text not null default 'property-photos',
    storage_path text not null,
    mime_type text not null,
    size_bytes bigint not null check (size_bytes >= 0),
    checksum text,
    status text not null default 'active' check (status in ('active', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint property_media_title_not_empty check (length(trim(title)) > 0),
    constraint property_media_storage_path_not_empty check (length(trim(storage_path)) > 0)
);
comment on table public.property_media is 'Metadata for property media assets stored in Supabase Storage (property-photos bucket).';

-- Table: users_extended (profile extensions for auth.users)
create table if not exists public.users_extended (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    full_name text,
    phone text,
    organisation text,
    primary_role text not null default 'viewer' check (primary_role in ('owner', 'buyer', 'agent', 'conveyancer', 'surveyor', 'admin', 'viewer')),
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
comment on table public.users_extended is 'Extended profile data for Supabase auth.users.';

-- Table: user_property_roles (role assignments per property)
create table if not exists public.user_property_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    property_id uuid not null references public.properties(id) on delete cascade,
    role text not null check (role in ('owner', 'buyer', 'agent', 'conveyancer', 'surveyor', 'admin', 'viewer')),
    granted_by_user_id uuid references auth.users(id) on delete cascade,
    granted_at timestamptz not null default now(),
    expires_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint user_property_roles_unique_assignment unique (user_id, property_id, role)
);
comment on table public.user_property_roles is 'Property-specific role assignments for users with optional expiry.';

-- Table: property_events (immutable event log for property lifecycle)
create table if not exists public.property_events (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties(id) on delete cascade,
    actor_user_id uuid references auth.users(id) on delete cascade,
    event_type text not null check (event_type in ('created', 'updated', 'status_changed', 'document_uploaded', 'media_uploaded', 'note_added', 'task_created', 'flag_added', 'flag_resolved')),
    event_payload jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.property_events is 'Immutable log of property-related events for auditability.';

-- Table: property_flags (quality/risk/compliance flags)
create table if not exists public.property_flags (
    id uuid primary key default gen_random_uuid(),
    property_id uuid not null references public.properties(id) on delete cascade,
    created_by_user_id uuid not null references auth.users(id) on delete cascade,
    flag_type text not null check (flag_type in ('data_quality', 'risk', 'compliance', 'ownership', 'document', 'other')),
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
    status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'dismissed')),
    description text,
    resolved_at timestamptz,
    resolved_by_user_id uuid references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz
);
comment on table public.property_flags is 'Flags for property data quality, risk, or compliance with severity and resolution tracking.';

-- Table: audit_logs (system-wide audit trail)
create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_user_id uuid references auth.users(id) on delete set null,
    action text not null,
    resource_type text not null,
    resource_id uuid,
    resource_path text,
    ip_address inet,
    user_agent text,
    metadata jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
comment on table public.audit_logs is 'Audit trail of sensitive actions across the platform.';

-- Updated-at trigger function (Supabase-compatible)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach updated_at triggers to all tables
drop trigger if exists set_updated_at_properties on public.properties;
create trigger set_updated_at_properties before update on public.properties
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_property_documents on public.property_documents;
create trigger set_updated_at_property_documents before update on public.property_documents
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_property_media on public.property_media;
create trigger set_updated_at_property_media before update on public.property_media
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_users_extended on public.users_extended;
create trigger set_updated_at_users_extended before update on public.users_extended
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_user_property_roles on public.user_property_roles;
create trigger set_updated_at_user_property_roles before update on public.user_property_roles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_property_events on public.property_events;
create trigger set_updated_at_property_events before update on public.property_events
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_property_flags on public.property_flags;
create trigger set_updated_at_property_flags before update on public.property_flags
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_audit_logs on public.audit_logs;
create trigger set_updated_at_audit_logs before update on public.audit_logs
for each row execute procedure public.set_updated_at();
