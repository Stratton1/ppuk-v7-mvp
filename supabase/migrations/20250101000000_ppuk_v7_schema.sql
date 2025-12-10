-- PPUK v7 - Core Schema (schema-only, no RLS)
-- Supabase-compatible; relies on pgcrypto for gen_random_uuid()

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.role_type as enum ('owner', 'buyer', 'agent', 'conveyancer', 'surveyor', 'admin', 'viewer');
create type public.property_status as enum ('draft', 'active', 'archived');
create type public.document_type as enum ('title', 'survey', 'search', 'identity', 'contract', 'warranty', 'planning', 'compliance', 'other');
create type public.media_type as enum ('photo', 'video', 'floorplan', 'other');
create type public.event_type as enum ('created', 'updated', 'status_changed', 'document_uploaded', 'media_uploaded', 'note_added', 'task_created', 'flag_added', 'flag_resolved');
create type public.notification_type as enum ('info', 'warning', 'action_required');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type public.integration_type as enum ('epc', 'hmlr', 'flood', 'postcodes', 'police', 'os', 'ons', 'other');

-- Timestamp trigger
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Users extension (profile data for auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  organisation text,
  primary_role role_type not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email)
);
create trigger users_set_updated_at before update on public.users
for each row execute procedure public.update_timestamp();

-- Profiles (additional user metadata)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  phone text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.update_timestamp();

-- Roles catalog
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name role_type not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger roles_set_updated_at before update on public.roles
for each row execute procedure public.update_timestamp();

-- User roles (global)
create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.users(id) on delete set null,
  primary key (user_id, role_id)
);

-- Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  uprn text not null unique,
  display_address text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  status property_status not null default 'draft',
  created_by_user_id uuid not null references public.users(id) on delete cascade,
  public_slug text unique,
  public_visibility boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint properties_display_address_not_empty check (length(trim(display_address)) > 0)
);
create trigger properties_set_updated_at before update on public.properties
for each row execute procedure public.update_timestamp();

-- Property stakeholders (per-property roles)
create table if not exists public.property_stakeholders (
  user_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  role role_type not null,
  granted_by_user_id uuid references public.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, property_id, role)
);
create trigger property_stakeholders_set_updated_at before update on public.property_stakeholders
for each row execute procedure public.update_timestamp();

-- Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  uploaded_by_user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  document_type document_type not null default 'other',
  storage_bucket text not null default 'property-documents',
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  status text not null default 'active',
  checksum text,
  version int not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint documents_title_not_empty check (length(trim(title)) > 0),
  constraint documents_storage_path_not_empty check (length(trim(storage_path)) > 0)
);
create index documents_property_id_idx on public.documents(property_id);
create trigger documents_set_updated_at before update on public.documents
for each row execute procedure public.update_timestamp();

-- Document versions
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  storage_path text not null,
  version int not null check (version >= 1),
  created_at timestamptz not null default now(),
  created_by_user_id uuid not null references public.users(id) on delete cascade,
  checksum text,
  mime_type text,
  size_bytes bigint,
  unique (document_id, version)
);

-- Media
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  uploaded_by_user_id uuid not null references public.users(id) on delete cascade,
  media_type media_type not null default 'photo',
  title text not null,
  storage_bucket text not null default 'property-photos',
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  status text not null default 'active',
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint media_title_not_empty check (length(trim(title)) > 0),
  constraint media_storage_path_not_empty check (length(trim(storage_path)) > 0)
);
create index media_property_id_idx on public.media(property_id);
create trigger media_set_updated_at before update on public.media
for each row execute procedure public.update_timestamp();

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null default 'info',
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notifications_user_id_idx on public.notifications(user_id);
create trigger notifications_set_updated_at before update on public.notifications
for each row execute procedure public.update_timestamp();

-- Activity log
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  resource_path text,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index activity_log_actor_idx on public.activity_log(actor_user_id);
create trigger activity_log_set_updated_at before update on public.activity_log
for each row execute procedure public.update_timestamp();

-- Property events
create table if not exists public.property_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  event_type event_type not null,
  event_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index property_events_property_id_idx on public.property_events(property_id);
create trigger property_events_set_updated_at before update on public.property_events
for each row execute procedure public.update_timestamp();

-- Property metadata (key/value)
create table if not exists public.property_metadata (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  meta_key text not null,
  meta_value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, meta_key)
);
create trigger property_metadata_set_updated_at before update on public.property_metadata
for each row execute procedure public.update_timestamp();

-- Integrations (cached results / config)
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  integration integration_type not null,
  status text not null default 'pending',
  payload jsonb,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, integration)
);
create trigger integrations_set_updated_at before update on public.integrations
for each row execute procedure public.update_timestamp();

-- Invitations
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  email text not null,
  role role_type not null,
  token text not null unique,
  status invitation_status not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invitations_email_idx on public.invitations(email);
create trigger invitations_set_updated_at before update on public.invitations
for each row execute procedure public.update_timestamp();

-- Tasks (optional but included)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'medium',
  due_date date,
  assigned_to_user_id uuid references public.users(id) on delete set null,
  created_by_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index tasks_property_id_idx on public.tasks(property_id);
create trigger tasks_set_updated_at before update on public.tasks
for each row execute procedure public.update_timestamp();
