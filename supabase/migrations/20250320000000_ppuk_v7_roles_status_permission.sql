-- PPUK v7 - Role Model Refactor (Primary roles + per-property status/permission)
-- Introduces:
--   - Global primary roles: consumer | agent | conveyancer | surveyor | admin
--   - Per-property status: owner | buyer | tenant
--   - Per-property permission: editor | viewer
--   - Updated helpers, RPCs, and RLS policies aligned to the new model

-- ============================================================================
-- 1) ENUMS
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_primary_role') then
    create type public.user_primary_role as enum ('consumer', 'agent', 'conveyancer', 'surveyor', 'admin');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_status_type') then
    create type public.property_status_type as enum ('owner', 'buyer', 'tenant');
  end if;
end$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_permission_type') then
    create type public.property_permission_type as enum ('editor', 'viewer');
  end if;
end$$;

-- ============================================================================
-- 2) GLOBAL PRIMARY ROLE MIGRATION
-- ============================================================================

alter table public.users
  alter column primary_role drop default;

alter table public.users
  alter column primary_role type public.user_primary_role using (
    case primary_role::text
      when 'admin' then 'admin'::public.user_primary_role
      when 'agent' then 'agent'::public.user_primary_role
      when 'conveyancer' then 'conveyancer'::public.user_primary_role
      when 'surveyor' then 'surveyor'::public.user_primary_role
      else 'consumer'::public.user_primary_role
    end
  );

alter table public.users
  alter column primary_role set default 'consumer';

-- Optional alignment for roles catalog (if populated)
alter table public.roles
  alter column name type public.user_primary_role using (
    case name::text
      when 'admin' then 'admin'::public.user_primary_role
      when 'agent' then 'agent'::public.user_primary_role
      when 'conveyancer' then 'conveyancer'::public.user_primary_role
      when 'surveyor' then 'surveyor'::public.user_primary_role
      else 'consumer'::public.user_primary_role
    end
  );

-- ============================================================================
-- 3) PROPERTY STAKEHOLDERS & INVITATIONS: STATUS + PERMISSION
-- ============================================================================

-- Add new columns
alter table public.property_stakeholders
  add column if not exists status public.property_status_type,
  add column if not exists permission public.property_permission_type;

alter table public.invitations
  add column if not exists property_status public.property_status_type,
  add column if not exists property_permission public.property_permission_type;

-- Migrate existing role data into status/permission
update public.property_stakeholders ps
set
  status = coalesce(
    status,
    case
      when ps.role::text = 'owner' then 'owner'::public.property_status_type
      else null
    end
  ),
  permission = coalesce(
    permission,
    case
      when ps.role::text = 'owner' then 'editor'::public.property_permission_type
      when ps.role::text = 'editor' then 'editor'::public.property_permission_type
      when ps.role::text = 'viewer' then 'viewer'::public.property_permission_type
      else null
    end
  )
where ps.deleted_at is null;

update public.invitations i
set
  property_status = coalesce(
    property_status,
    case
      when i.role::text = 'owner' then 'owner'::public.property_status_type
      else null
    end
  ),
  property_permission = coalesce(
    property_permission,
    case
      when i.role::text = 'owner' then 'editor'::public.property_permission_type
      when i.role::text = 'editor' then 'editor'::public.property_permission_type
      when i.role::text = 'viewer' then 'viewer'::public.property_permission_type
      else null
    end
  );

-- ============================================================================
-- 4) HELPER FUNCTIONS (Roles/Permissions model)
-- ============================================================================

drop function if exists public.is_admin() cascade;
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.primary_role = 'admin'
  );
$$;
grant execute on function public.is_admin() to authenticated;

drop function if exists public.role_for_property(uuid) cascade;
create or replace function public.role_for_property(property_id uuid)
returns public.property_permission_type
language sql
stable
security definer
as $$
  with access as (
    select
      ps.permission,
      ps.status
    from public.property_stakeholders ps
    where ps.property_id = role_for_property.property_id
      and ps.user_id = auth.uid()
      and ps.deleted_at is null
      and (ps.expires_at is null or ps.expires_at > now())
  )
  select
    case
      when public.is_service_role() then 'editor'::public.property_permission_type
      when public.is_admin() then 'editor'::public.property_permission_type
      when exists (select 1 from access where status = 'owner') then 'editor'::public.property_permission_type
      when exists (select 1 from access where permission = 'editor') then 'editor'::public.property_permission_type
      when exists (select 1 from access where permission = 'viewer' or status in ('buyer','tenant')) then 'viewer'::public.property_permission_type
      else null
    end;
$$;
grant execute on function public.role_for_property(uuid) to authenticated;

drop function if exists public.is_property_owner(uuid) cascade;
create or replace function public.is_property_owner(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select
    public.is_service_role()
    or public.is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.deleted_at is null
        and p.created_by_user_id = user_id
    )
    or exists (
      select 1
      from public.property_stakeholders ps
      where ps.property_id = property_id
        and ps.user_id = user_id
        and ps.status = 'owner'
        and ps.deleted_at is null
        and (ps.expires_at is null or ps.expires_at > now())
    );
$$;
grant execute on function public.is_property_owner(uuid, uuid) to authenticated;

drop function if exists public.is_property_buyer(uuid) cascade;
create or replace function public.is_property_buyer(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.property_stakeholders ps
    where ps.property_id = property_id
      and ps.user_id = user_id
      and ps.status = 'buyer'
      and ps.deleted_at is null
      and (ps.expires_at is null or ps.expires_at > now())
  );
$$;
grant execute on function public.is_property_buyer(uuid, uuid) to authenticated;

drop function if exists public.is_property_tenant(uuid) cascade;
create or replace function public.is_property_tenant(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.property_stakeholders ps
    where ps.property_id = property_id
      and ps.user_id = user_id
      and ps.status = 'tenant'
      and ps.deleted_at is null
      and (ps.expires_at is null or ps.expires_at > now())
  );
$$;
grant execute on function public.is_property_tenant(uuid, uuid) to authenticated;

drop function if exists public.has_property_role(uuid, text[]) cascade;
create or replace function public.has_property_role(
  property_id uuid,
  allowed_roles text[],
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
as $$
  select
    public.is_service_role()
    or public.is_admin()
    or exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.deleted_at is null
        and p.created_by_user_id = user_id
        and 'owner' = any(allowed_roles)
    )
    or exists (
      select 1
      from public.property_stakeholders ps
      where ps.property_id = property_id
        and ps.user_id = user_id
        and ps.deleted_at is null
        and (ps.expires_at is null or ps.expires_at > now())
        and (
          (ps.status is not null and ps.status::text = any(allowed_roles))
          or (ps.permission is not null and ps.permission::text = any(allowed_roles))
        )
    );
$$;
grant execute on function public.has_property_role(uuid, text[], uuid) to authenticated;

drop function if exists public.is_property_editor(uuid) cascade;
create or replace function public.is_property_editor(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select
    public.is_service_role()
    or public.is_admin()
    or public.is_property_owner(property_id, user_id)
    or exists (
      select 1
      from public.property_stakeholders ps
      where ps.property_id = property_id
        and ps.user_id = user_id
        and ps.deleted_at is null
        and (ps.expires_at is null or ps.expires_at > now())
        and ps.permission = 'editor'
    );
$$;
grant execute on function public.is_property_editor(uuid, uuid) to authenticated;

drop function if exists public.is_property_viewer(uuid) cascade;
create or replace function public.is_property_viewer(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$
  select
    public.is_service_role()
    or public.is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.public_visibility = true
        and p.deleted_at is null
    )
    or public.is_property_owner(property_id, user_id)
    or exists (
      select 1
      from public.property_stakeholders ps
      where ps.property_id = property_id
        and ps.user_id = user_id
        and ps.deleted_at is null
        and (ps.expires_at is null or ps.expires_at > now())
        and (
          ps.permission in ('editor','viewer')
          or ps.status in ('buyer','tenant')
        )
    );
$$;
grant execute on function public.is_property_viewer(uuid, uuid) to authenticated;

drop function if exists public.can_edit_property(uuid) cascade;
create or replace function public.can_edit_property(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$ select public.is_property_editor(property_id, user_id) $$;
grant execute on function public.can_edit_property(uuid, uuid) to authenticated;

drop function if exists public.can_view_property(uuid) cascade;
create or replace function public.can_view_property(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$ select public.is_property_viewer(property_id, user_id) $$;
grant execute on function public.can_view_property(uuid, uuid) to authenticated, anon;

drop function if exists public.can_upload(uuid) cascade;
create or replace function public.can_upload(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$ select public.can_edit_property(property_id, user_id) $$;
grant execute on function public.can_upload(uuid, uuid) to authenticated;

drop function if exists public.can_delete(uuid) cascade;
create or replace function public.can_delete(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$ select public.is_property_owner(property_id, user_id) $$;
grant execute on function public.can_delete(uuid, uuid) to authenticated;

drop function if exists public.can_invite(uuid) cascade;
create or replace function public.can_invite(property_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
as $$ select public.is_property_owner(property_id, user_id) or public.is_admin() $$;
grant execute on function public.can_invite(uuid, uuid) to authenticated;

-- ============================================================================
-- 5) RPCs (grant/revoke/invite + helpers)
-- ============================================================================

drop function if exists public.create_property_with_role(text, text, numeric, numeric, text) cascade;
create or replace function public.create_property_with_role(
  p_uprn text,
  p_display_address text,
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_status text default 'draft'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required to create property';
  end if;

  if p_status not in ('draft', 'active', 'archived') then
    raise exception 'Invalid status. Must be: draft, active, or archived';
  end if;

  insert into public.properties (
    id, uprn, display_address, latitude, longitude, status,
    created_by_user_id, public_visibility, created_at, updated_at
  )
  values (
    gen_random_uuid(), p_uprn, p_display_address, p_latitude, p_longitude, p_status,
    v_user_id, false, now(), now()
  )
  returning id into v_property_id;

  insert into public.property_stakeholders (
    user_id, property_id, role, status, permission, granted_by_user_id, granted_at, created_at, updated_at
  )
  values (
    v_user_id, v_property_id, 'owner', 'owner', 'editor', v_user_id, now(), now(), now()
  )
  on conflict (user_id, property_id, role) do update
    set status = excluded.status,
        permission = excluded.permission,
        deleted_at = null,
        updated_at = now();

  insert into public.property_events (
    id, property_id, actor_user_id, event_type, event_payload, created_at, updated_at
  )
  values (
    gen_random_uuid(),
    v_property_id,
    v_user_id,
    'created',
    jsonb_build_object('created_source', 'manual_form', 'uprn', p_uprn, 'address', p_display_address, 'initial_status', p_status),
    now(),
    now()
  );

  return v_property_id;
end;
$$;
grant execute on function public.create_property_with_role(text, text, numeric, numeric, text) to authenticated;

drop function if exists public.update_property_with_event(uuid, text, text, numeric, numeric, text) cascade;
create or replace function public.update_property_with_event(
  p_property_id uuid,
  p_uprn text,
  p_display_address text,
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_status text default 'draft'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_old record;
  v_changes jsonb := '{}'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.can_edit_property(p_property_id, v_user_id) then
    raise exception 'Not authorized to edit property';
  end if;

  select * into v_old from public.properties where id = p_property_id and deleted_at is null;
  if not found then
    raise exception 'Property not found';
  end if;

  if p_status not in ('draft', 'active', 'archived') then
    raise exception 'Invalid status';
  end if;

  if v_old.uprn is distinct from p_uprn then
    v_changes := v_changes || jsonb_build_object('uprn', jsonb_build_object('before', v_old.uprn, 'after', p_uprn));
  end if;
  if v_old.display_address is distinct from p_display_address then
    v_changes := v_changes || jsonb_build_object('display_address', jsonb_build_object('before', v_old.display_address, 'after', p_display_address));
  end if;
  if v_old.latitude is distinct from p_latitude then
    v_changes := v_changes || jsonb_build_object('latitude', jsonb_build_object('before', v_old.latitude, 'after', p_latitude));
  end if;
  if v_old.longitude is distinct from p_longitude then
    v_changes := v_changes || jsonb_build_object('longitude', jsonb_build_object('before', v_old.longitude, 'after', p_longitude));
  end if;
  if v_old.status is distinct from p_status then
    v_changes := v_changes || jsonb_build_object('status', jsonb_build_object('before', v_old.status, 'after', p_status));
  end if;

  update public.properties
  set uprn = p_uprn,
      display_address = p_display_address,
      latitude = p_latitude,
      longitude = p_longitude,
      status = p_status,
      updated_at = now()
  where id = p_property_id;

  insert into public.property_events (id, property_id, actor_user_id, event_type, event_payload, created_at, updated_at)
  values (
    gen_random_uuid(),
    p_property_id,
    v_user_id,
    'updated',
    jsonb_build_object('action','updated','changes',v_changes,'updated_at',now()),
    now(),
    now()
  );

  return p_property_id;
end;
$$;
grant execute on function public.update_property_with_event(uuid, text, text, numeric, numeric, text) to authenticated;

drop function if exists public.grant_property_role(uuid, uuid, public.property_role_type, timestamptz) cascade;
create or replace function public.grant_property_role(
  target_user_id uuid,
  property_id uuid,
  status public.property_status_type default null,
  permission public.property_permission_type default null,
  expires_at timestamptz default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_permission public.property_permission_type := permission;
  v_status public.property_status_type := status;
  v_role_for_compat public.property_role_type := 'viewer';
begin
  if not (public.can_invite(property_id, auth.uid()) or public.is_service_role()) then
    raise exception 'Not authorized to grant roles';
  end if;

  if v_status is null and v_permission is null then
    raise exception 'Provide at least a status or permission';
  end if;

  if v_status = 'owner' and v_permission is null then
    v_permission := 'editor';
  end if;

  v_role_for_compat := case
    when v_status = 'owner' then 'owner'::public.property_role_type
    when v_permission = 'editor' then 'editor'::public.property_role_type
    else 'viewer'::public.property_role_type
  end;

  insert into public.property_stakeholders (
    user_id, property_id, role, status, permission, granted_by_user_id, granted_at, expires_at, created_at, updated_at, deleted_at
  )
  values (
    target_user_id, property_id, v_role_for_compat, v_status, v_permission, auth.uid(), now(), expires_at, now(), now(), null
  )
  on conflict (user_id, property_id, role) do update
    set status = coalesce(excluded.status, public.property_stakeholders.status),
        permission = coalesce(excluded.permission, public.property_stakeholders.permission),
        expires_at = excluded.expires_at,
        deleted_at = null,
        updated_at = now();
end;
$$;
grant execute on function public.grant_property_role(uuid, uuid, public.property_status_type, public.property_permission_type, timestamptz) to authenticated;

drop function if exists public.revoke_property_role(uuid, uuid, public.property_role_type) cascade;
create or replace function public.revoke_property_role(
  target_user_id uuid,
  property_id uuid,
  status public.property_status_type default null,
  permission public.property_permission_type default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_role public.property_role_type := (
    case
      when status = 'owner' then 'owner'::public.property_role_type
      when permission = 'editor' then 'editor'::public.property_role_type
      else 'viewer'::public.property_role_type
    end
  );
  v_is_owner boolean := status = 'owner';
  owner_count int;
begin
  if not (public.can_invite(property_id, auth.uid()) or public.is_service_role()) then
    raise exception 'Not authorized to revoke roles';
  end if;

  if v_is_owner then
    select count(*) into owner_count
    from public.property_stakeholders
    where property_id = revoke_property_role.property_id
      and status = 'owner'
      and deleted_at is null;

    if owner_count <= 1 then
      raise exception 'Cannot remove the last owner';
    end if;
  end if;

  update public.property_stakeholders
  set
    status = case when status is not null and status = revoke_property_role.status then null else status end,
    permission = case when permission is not null and permission = revoke_property_role.permission then null else permission end,
    deleted_at = now(),
    updated_at = now()
  where user_id = target_user_id
    and property_id = property_id
    and role = v_role
    and deleted_at is null;
end;
$$;
grant execute on function public.revoke_property_role(uuid, uuid, public.property_status_type, public.property_permission_type) to authenticated;

drop function if exists public.invite_user_to_property(uuid, text, public.property_role_type, timestamptz) cascade;
create or replace function public.invite_user_to_property(
  property_id uuid,
  email text,
  status public.property_status_type default null,
  permission public.property_permission_type default null,
  expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_token uuid := gen_random_uuid();
  v_invitation_id uuid;
  v_role_for_compat public.property_role_type := (
    case
      when status = 'owner' then 'owner'::public.property_role_type
      when permission = 'editor' then 'editor'::public.property_role_type
      else 'viewer'::public.property_role_type
    end
  );
begin
  if not public.can_invite(property_id, auth.uid()) then
    raise exception 'Not authorized to invite';
  end if;

  if status is null and permission is null then
    raise exception 'Provide at least a status or permission';
  end if;

  if status = 'owner' and permission is null then
    permission := 'editor';
  end if;

  insert into public.invitations (
    id, property_id, email, role, property_status, property_permission, token, status, expires_at, created_at, updated_at
  )
  values (
    gen_random_uuid(),
    property_id,
    email,
    v_role_for_compat,
    status,
    permission,
    v_token::text,
    'pending',
    expires_at,
    now(),
    now()
  )
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$$;
grant execute on function public.invite_user_to_property(uuid, text, public.property_status_type, public.property_permission_type, timestamptz) to authenticated;

drop function if exists public.accept_invitation(text) cascade;
create or replace function public.accept_invitation(
  invitation_token text
)
returns void
language plpgsql
security definer
as $$
declare
  v_inv record;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_inv
  from public.invitations
  where token = invitation_token
    and status = 'pending'
    and (expires_at is null or expires_at > now())
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'Invalid or expired invitation';
  end if;

  update public.invitations
    set status = 'accepted',
        updated_at = now()
  where id = v_inv.id;

  perform public.grant_property_role(v_user_id, v_inv.property_id, v_inv.property_status, v_inv.property_permission, v_inv.expires_at);
end;
$$;
grant execute on function public.accept_invitation(text) to authenticated;

drop function if exists public.set_public_visibility(uuid, boolean) cascade;
create or replace function public.set_public_visibility(
  property_id uuid,
  visible boolean
)
returns void
language plpgsql
security definer
as $$
begin
  if not (public.can_edit_property(property_id) or public.is_property_owner(property_id)) then
    raise exception 'Not authorized to change visibility';
  end if;

  update public.properties
    set public_visibility = visible,
        updated_at = now()
  where id = property_id;
end;
$$;
grant execute on function public.set_public_visibility(uuid, boolean) to authenticated;

-- get_user_properties with statuses + permission
drop function if exists public.get_user_properties(uuid) cascade;
create or replace function public.get_user_properties(
  user_id uuid default auth.uid()
)
returns table (
  property_id uuid,
  statuses public.property_status_type[],
  permission public.property_permission_type,
  access_expires_at timestamptz,
  display_address text,
  uprn text,
  status text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz,
  public_visibility boolean
)
language sql
stable
security definer
as $$
  with stakeholder_rows as (
    select
      ps.property_id,
      array_remove(array_agg(distinct ps.status) filter (where ps.status is not null), null) as statuses,
      max(
        case
          when ps.status = 'owner' then 2
          when ps.permission = 'editor' then 2
          when ps.permission = 'viewer' then 1
          else 0
        end
      ) as permission_rank,
      min(ps.expires_at) filter (where ps.expires_at is not null) as access_expires_at
    from public.property_stakeholders ps
    where ps.user_id = get_user_properties.user_id
      and ps.deleted_at is null
      and (ps.expires_at is null or ps.expires_at > now())
    group by ps.property_id
  ),
  owner_created as (
    select
      p.id as property_id,
      array['owner']::public.property_status_type[] as statuses,
      2 as permission_rank,
      null::timestamptz as access_expires_at
    from public.properties p
    where p.created_by_user_id = get_user_properties.user_id
      and p.deleted_at is null
  ),
  combined as (
    select * from stakeholder_rows
    union all
    select * from owner_created
  ),
  reduced as (
    select
      c.property_id,
      array_agg(distinct s.status) as statuses,
      max(c.permission_rank) as permission_rank,
      min(c.access_expires_at) as access_expires_at
    from combined c
    left join lateral unnest(c.statuses) as s(status) on true
    group by c.property_id
  )
  select
    r.property_id,
    array_remove(coalesce(r.statuses, array[]::public.property_status_type[]), null) as statuses,
    case
      when r.permission_rank >= 2 then 'editor'::public.property_permission_type
      when r.permission_rank = 1 then 'viewer'::public.property_permission_type
      else null
    end as permission,
    r.access_expires_at,
    p.display_address,
    p.uprn,
    p.status,
    p.latitude,
    p.longitude,
    p.created_at,
    p.public_visibility
  from reduced r
  join public.properties p on p.id = r.property_id
  where p.deleted_at is null;
$$;
grant execute on function public.get_user_properties(uuid) to authenticated;

-- ============================================================================
-- 6) RLS POLICIES (recreate to use new helpers)
-- ============================================================================

-- PROFILES
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using (user_id = auth.uid() or public.is_admin() or public.is_service_role());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (user_id = auth.uid() or public.is_admin() or public.is_service_role());

-- PROPERTIES
drop policy if exists properties_read on public.properties;
drop policy if exists properties_write on public.properties;
create policy properties_read on public.properties for select
  using (public.can_view_property(id));
create policy properties_write on public.properties for all
  using (public.can_edit_property(id));

-- PROPERTY STAKEHOLDERS
drop policy if exists stakeholders_read on public.property_stakeholders;
drop policy if exists stakeholders_write on public.property_stakeholders;
create policy stakeholders_read on public.property_stakeholders for select
  using (
    user_id = auth.uid()
    or public.can_invite(property_id)
  );
create policy stakeholders_write on public.property_stakeholders for all
  using (public.can_invite(property_id))
  with check (public.can_invite(property_id));

-- DOCUMENTS
drop policy if exists documents_read on public.documents;
drop policy if exists documents_write on public.documents;
create policy documents_read on public.documents for select
  using (public.can_view_property(property_id));
create policy documents_write on public.documents for all
  using (public.can_upload(property_id))
  with check (public.can_upload(property_id));

-- MEDIA
drop policy if exists media_read on public.media;
drop policy if exists media_write on public.media;
create policy media_read on public.media for select
  using (public.can_view_property(property_id));
create policy media_write on public.media for all
  using (public.can_upload(property_id))
  with check (public.can_upload(property_id));

-- TASKS
drop policy if exists tasks_read on public.tasks;
drop policy if exists tasks_write on public.tasks;
create policy tasks_read on public.tasks for select
  using (public.can_view_property(property_id));
create policy tasks_write on public.tasks for all
  using (public.can_edit_property(property_id))
  with check (public.can_edit_property(property_id));

-- PROPERTY EVENTS
drop policy if exists property_events_read on public.property_events;
drop policy if exists property_events_insert on public.property_events;
create policy property_events_read on public.property_events for select
  using (public.can_view_property(property_id));
create policy property_events_insert on public.property_events for insert
  with check (public.can_edit_property(property_id));

-- PROPERTY METADATA
drop policy if exists property_metadata_read on public.property_metadata;
drop policy if exists property_metadata_write on public.property_metadata;
create policy property_metadata_read on public.property_metadata for select
  using (public.can_view_property(property_id));
create policy property_metadata_write on public.property_metadata for all
  using (public.can_edit_property(property_id))
  with check (public.can_edit_property(property_id));

-- INVITATIONS
drop policy if exists invitations_read on public.invitations;
drop policy if exists invitations_write on public.invitations;
create policy invitations_read on public.invitations for select
  using (
    public.can_invite(property_id)
    or email = (select email from public.users u where u.id = auth.uid())
  );
create policy invitations_write on public.invitations for all
  using (public.can_invite(property_id))
  with check (public.can_invite(property_id));

-- NOTIFICATIONS / ACTIVITY LOG
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select
  using (user_id = auth.uid() or public.is_admin() or public.is_service_role());

drop policy if exists activity_log_admin_read on public.activity_log;
create policy activity_log_admin_read on public.activity_log for select
  using (public.is_admin() or public.is_service_role());
