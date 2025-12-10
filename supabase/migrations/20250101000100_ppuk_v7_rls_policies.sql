-- PPUK v7 - RLS Policies (production-ready)
-- Assumptions:
-- - auth.uid() returns the authenticated user id
-- - "service role" uses the service key (bypasses RLS in Supabase)
-- - role checks rely on role_type enum values; adjust if using JWT claims

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.properties enable row level security;
alter table public.property_stakeholders enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.media enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.property_events enable row level security;
alter table public.property_metadata enable row level security;
alter table public.integrations enable row level security;
alter table public.invitations enable row level security;
alter table public.tasks enable row level security;

-- Helper: is_service_role (Supabase checks service role via jwt claim "role" = "service_role")
create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
$$;

-- Helper: is_property_stakeholder(property_id uuid)
-- Note: Using CREATE OR REPLACE with same parameter name to avoid dependency issues
create or replace function public.is_property_stakeholder(property_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.property_stakeholders ps
    where ps.property_id = is_property_stakeholder.property_id
      and ps.user_id = auth.uid()
      and ps.deleted_at is null
  )
$$;

-- Helper: is_property_owner(property_id uuid)
-- Note: Replaces old function that referenced user_property_roles, now uses property_stakeholders
create or replace function public.is_property_owner(property_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.property_stakeholders ps
    where ps.property_id = is_property_owner.property_id
      and ps.user_id = auth.uid()
      and ps.role = 'owner'
      and ps.deleted_at is null
  )
$$;

-- PROFILES
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = user_id or public.is_service_role());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = user_id or public.is_service_role());

-- USER ROLES
drop policy if exists user_roles_self_select on public.user_roles;
create policy user_roles_self_select on public.user_roles
  for select using (auth.uid() = user_id or public.is_service_role());

drop policy if exists user_roles_service_insert on public.user_roles;
create policy user_roles_service_insert on public.user_roles
  for insert with check (public.is_service_role());

drop policy if exists user_roles_service_delete on public.user_roles;
create policy user_roles_service_delete on public.user_roles
  for delete using (public.is_service_role());

-- PROPERTIES
drop policy if exists properties_owner_rw on public.properties;
create policy properties_owner_rw on public.properties
  for all
  using (public.is_property_owner(id) or public.is_service_role())
  with check (public.is_property_owner(id) or public.is_service_role());

drop policy if exists properties_stakeholder_read on public.properties;
create policy properties_stakeholder_read on public.properties
  for select
  using (
    public.is_property_stakeholder(id)
    or public.is_property_owner(id)
    or public.is_service_role()
  );

-- PROPERTY STAKEHOLDERS
drop policy if exists stakeholders_read on public.property_stakeholders;
create policy stakeholders_read on public.property_stakeholders
  for select
  using (
    user_id = auth.uid()
    or public.is_property_owner(property_id)
    or public.is_service_role()
  );

drop policy if exists stakeholders_manage on public.property_stakeholders;
create policy stakeholders_manage on public.property_stakeholders
  for all
  using (public.is_property_owner(property_id) or public.is_service_role())
  with check (public.is_property_owner(property_id) or public.is_service_role());

-- DOCUMENTS
drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents
  for select
  using (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists documents_owner_insert on public.documents;
create policy documents_owner_insert on public.documents
  for insert
  with check (public.is_property_owner(property_id) or public.is_service_role());

drop policy if exists documents_owner_update on public.documents;
create policy documents_owner_update on public.documents
  for update
  using (public.is_property_owner(property_id) or public.is_service_role())
  with check (public.is_property_owner(property_id) or public.is_service_role());

drop policy if exists documents_owner_delete on public.documents;
create policy documents_owner_delete on public.documents
  for delete
  using (public.is_property_owner(property_id) or public.is_service_role());

-- DOCUMENT VERSIONS (immutable; no delete/update)
drop policy if exists document_versions_read on public.document_versions;
create policy document_versions_read on public.document_versions
  for select
  using (
    public.is_property_owner(
      (select d.property_id from public.documents d where d.id = document_id)
    )
    or public.is_property_stakeholder(
      (select d.property_id from public.documents d where d.id = document_id)
    )
    or public.is_service_role()
  );

drop policy if exists document_versions_insert on public.document_versions;
create policy document_versions_insert on public.document_versions
  for insert
  with check (
    public.is_property_owner(
      (select d.property_id from public.documents d where d.id = document_id)
    )
    or public.is_service_role()
  );

-- MEDIA
drop policy if exists media_read on public.media;
create policy media_read on public.media
  for select
  using (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists media_insert on public.media;
create policy media_insert on public.media
  for insert
  with check (public.is_property_owner(property_id) or public.is_service_role());

drop policy if exists media_update on public.media;
create policy media_update on public.media
  for update
  using (public.is_property_owner(property_id) or public.is_service_role())
  with check (public.is_property_owner(property_id) or public.is_service_role());

drop policy if exists media_delete on public.media;
create policy media_delete on public.media
  for delete
  using (public.is_property_owner(property_id) or public.is_service_role());

-- NOTIFICATIONS
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications
  for select
  using (user_id = auth.uid() or public.is_service_role());

-- ACTIVITY LOG
drop policy if exists activity_log_admin_read on public.activity_log;
create policy activity_log_admin_read on public.activity_log
  for select
  using (public.is_service_role());

-- PROPERTY EVENTS
drop policy if exists property_events_read on public.property_events;
create policy property_events_read on public.property_events
  for select
  using (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists property_events_insert on public.property_events;
create policy property_events_insert on public.property_events
  for insert
  with check (public.is_property_owner(property_id) or public.is_service_role());

-- PROPERTY METADATA
drop policy if exists property_metadata_read on public.property_metadata;
create policy property_metadata_read on public.property_metadata
  for select
  using (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists property_metadata_write on public.property_metadata;
create policy property_metadata_write on public.property_metadata
  for all
  using (public.is_property_owner(property_id) or public.is_service_role())
  with check (public.is_property_owner(property_id) or public.is_service_role());

-- INTEGRATIONS
drop policy if exists integrations_read on public.integrations;
create policy integrations_read on public.integrations
  for select
  using (
    property_id is null
    or public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists integrations_write on public.integrations;
create policy integrations_write on public.integrations
  for all
  using (
    property_id is null
    or public.is_property_owner(property_id)
    or public.is_service_role()
  )
  with check (
    property_id is null
    or public.is_property_owner(property_id)
    or public.is_service_role()
  );

-- INVITATIONS
drop policy if exists invitations_read on public.invitations;
create policy invitations_read on public.invitations
  for select
  using (
    email = (select email from public.users u where u.id = auth.uid())
    or public.is_property_owner(property_id)
    or public.is_service_role()
  );

drop policy if exists invitations_insert on public.invitations;
create policy invitations_insert on public.invitations
  for insert
  with check (public.is_property_owner(property_id) or public.is_service_role());

drop policy if exists invitations_delete on public.invitations;
create policy invitations_delete on public.invitations
  for delete
  using (public.is_property_owner(property_id) or public.is_service_role());

-- TASKS
drop policy if exists tasks_read on public.tasks;
create policy tasks_read on public.tasks
  for select
  using (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert
  with check (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update
  using (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  )
  with check (
    public.is_property_owner(property_id)
    or public.is_property_stakeholder(property_id)
    or public.is_service_role()
  );

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
  for delete
  using (public.is_property_owner(property_id) or public.is_service_role());
