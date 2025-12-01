-- PPUK v7 - Roles/Permissions Alignment (owner/editor/viewer)
-- Standardizes property roles, rebuilds helpers, RPCs, and RLS to the v7 model.

-- ============================================================================
-- Role normalization: constrain to owner/editor/viewer
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_role_type') then
    create type public.property_role_type as enum ('owner', 'editor', 'viewer');
  end if;
end$$;

alter table public.property_stakeholders
  alter column role type public.property_role_type using (
    case
      when role::text = 'owner' then 'owner'::public.property_role_type
      when role::text in ('editor', 'agent', 'conveyancer', 'surveyor') then 'editor'::public.property_role_type
      else 'viewer'::public.property_role_type
    end
  );

-- Invitations role alignment
alter table public.invitations
  alter column role type public.property_role_type using (
    case
      when role::text = 'owner' then 'owner'::public.property_role_type
      when role::text in ('editor', 'agent', 'conveyancer', 'surveyor') then 'editor'::public.property_role_type
      else 'viewer'::public.property_role_type
    end
  );

-- ============================================================================
-- Helper functions (owner/editor/viewer model)
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
returns public.property_role_type
language sql
stable
security definer
as $$
  select
    (case
      when public.is_service_role() then 'owner'::public.property_role_type
      when p.created_by_user_id = auth.uid() then 'owner'::public.property_role_type
      when exists (
        select 1 from public.property_stakeholders ps
        where ps.property_id = property_id
          and ps.user_id = auth.uid()
          and ps.role = 'owner'
          and ps.deleted_at is null
          and (ps.expires_at is null or ps.expires_at > now())
      ) then 'owner'::public.property_role_type
      when exists (
        select 1 from public.property_stakeholders ps
        where ps.property_id = property_id
          and ps.user_id = auth.uid()
          and ps.role = 'editor'
          and ps.deleted_at is null
          and (ps.expires_at is null or ps.expires_at > now())
      ) then 'editor'::public.property_role_type
      when exists (
        select 1 from public.property_stakeholders ps
        where ps.property_id = property_id
          and ps.user_id = auth.uid()
          and ps.role = 'viewer'
          and ps.deleted_at is null
          and (ps.expires_at is null or ps.expires_at > now())
      ) then 'viewer'::public.property_role_type
      else null
    end)
  from public.properties p
  where p.id = property_id
    and p.deleted_at is null;
$$;
grant execute on function public.role_for_property(uuid) to authenticated;

drop function if exists public.has_property_role(uuid, text[]) cascade;
create or replace function public.has_property_role(
  property_id uuid,
  allowed_roles text[]
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
        and p.created_by_user_id = auth.uid()
        and 'owner' = any(allowed_roles)
    )
    or exists (
      select 1
      from public.property_stakeholders ps
      where ps.property_id = property_id
        and ps.user_id = auth.uid()
        and ps.role = any(allowed_roles::public.property_role_type[])
        and ps.deleted_at is null
        and (ps.expires_at is null or ps.expires_at > now())
    );
$$;
grant execute on function public.has_property_role(uuid, text[]) to authenticated;

drop function if exists public.is_property_owner(uuid) cascade;
create or replace function public.is_property_owner(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.has_property_role(property_id, array['owner']) $$;
grant execute on function public.is_property_owner(uuid) to authenticated;

drop function if exists public.is_property_editor(uuid) cascade;
create or replace function public.is_property_editor(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.has_property_role(property_id, array['owner','editor']) $$;
grant execute on function public.is_property_editor(uuid) to authenticated;

drop function if exists public.is_property_viewer(uuid) cascade;
create or replace function public.is_property_viewer(property_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select
    public.has_property_role(property_id, array['owner','editor','viewer'])
    or exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.public_visibility = true
        and p.deleted_at is null
    )
    or public.is_service_role()
    or public.is_admin();
$$;
grant execute on function public.is_property_viewer(uuid) to authenticated;

drop function if exists public.can_edit_property(uuid) cascade;
create or replace function public.can_edit_property(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.is_property_editor(property_id) $$;
grant execute on function public.can_edit_property(uuid) to authenticated;

drop function if exists public.can_view_property(uuid) cascade;
create or replace function public.can_view_property(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.is_property_viewer(property_id) $$;
grant execute on function public.can_view_property(uuid) to authenticated;

drop function if exists public.can_upload(uuid) cascade;
create or replace function public.can_upload(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.is_property_editor(property_id) $$;
grant execute on function public.can_upload(uuid) to authenticated;

drop function if exists public.can_delete(uuid) cascade;
create or replace function public.can_delete(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.is_property_owner(property_id) $$;
grant execute on function public.can_delete(uuid) to authenticated;

drop function if exists public.can_invite(uuid) cascade;
create or replace function public.can_invite(property_id uuid)
returns boolean
language sql
stable
security definer
as $$ select public.is_property_owner(property_id) or public.is_admin() $$;
grant execute on function public.can_invite(uuid) to authenticated;

-- ============================================================================
-- RPCs (v7 role model)
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
    user_id, property_id, role, granted_by_user_id, granted_at, created_at, updated_at
  )
  values (
    v_user_id, v_property_id, 'owner', v_user_id, now(), now(), now()
  )
  on conflict (user_id, property_id, role) do nothing;

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

  if not public.can_edit_property(p_property_id) then
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

drop function if exists public.search_properties(text, integer) cascade;
create or replace function public.search_properties(
  query_text text,
  result_limit integer default 50
)
returns table (
  id uuid,
  display_address text,
  uprn text,
  status text,
  latitude numeric,
  longitude numeric
)
language sql
stable
security definer
as $$
  with accessible as (
    select p.*
    from public.properties p
    where p.deleted_at is null
      and (
        p.public_visibility = true
        or public.can_view_property(p.id)
      )
  )
  select
    id, display_address, uprn, status, latitude, longitude
  from accessible
  where display_address ilike '%' || query_text || '%'
     or uprn ilike '%' || query_text || '%'
  order by display_address asc
  limit result_limit;
$$;
grant execute on function public.search_properties(text, integer) to authenticated, anon;

drop function if exists public.get_user_properties(uuid) cascade;
create or replace function public.get_user_properties(
  user_id uuid default auth.uid()
)
returns table (
  property_id uuid,
  role public.property_role_type,
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
  with base as (
    select
      p.id as property_id,
      'owner'::public.property_role_type as role,
      null::timestamptz as access_expires_at,
      p.display_address,
      p.uprn,
      p.status,
      p.latitude,
      p.longitude,
      p.created_at,
      p.public_visibility
    from public.properties p
    where p.created_by_user_id = get_user_properties.user_id
      and p.deleted_at is null
    union all
    select
      ps.property_id,
      ps.role,
      ps.expires_at,
      p.display_address,
      p.uprn,
      p.status,
      p.latitude,
      p.longitude,
      p.created_at,
      p.public_visibility
    from public.property_stakeholders ps
    join public.properties p on p.id = ps.property_id
    where ps.user_id = get_user_properties.user_id
      and ps.deleted_at is null
      and p.deleted_at is null
  )
  select distinct on (property_id)
    property_id, role, access_expires_at, display_address, uprn, status, latitude, longitude, created_at, public_visibility
  from base
  order by property_id, case when role='owner' then 1 when role='editor' then 2 else 3 end, coalesce(access_expires_at, 'infinity');
$$;
grant execute on function public.get_user_properties(uuid) to authenticated;

drop function if exists public.get_recent_activity(uuid) cascade;
create or replace function public.get_recent_activity(
  auth_uid uuid default auth.uid()
)
returns table (
  property_id uuid,
  property_address text,
  event_type text,
  created_at timestamptz
)
language sql
stable
security definer
as $$
  with accessible as (
    select id
    from public.properties p
    where p.deleted_at is null
      and (
        p.public_visibility = true
        or public.can_view_property(p.id)
      )
      and (
        p.created_by_user_id = auth_uid
        or exists (
          select 1 from public.property_stakeholders ps
          where ps.property_id = p.id and ps.user_id = auth_uid and ps.deleted_at is null
        )
      )
  )
  select
    e.property_id,
    p.display_address as property_address,
    e.event_type,
    e.created_at
  from public.property_events e
  join public.properties p on p.id = e.property_id
  where e.property_id in (select id from accessible)
  order by e.created_at desc
  limit 100;
$$;
grant execute on function public.get_recent_activity(uuid) to authenticated;

drop function if exists public.get_dashboard_stats(uuid) cascade;
create or replace function public.get_dashboard_stats(
  auth_uid uuid default auth.uid()
)
returns table (
  owned_properties integer,
  accessible_properties integer,
  total_documents integer,
  total_media integer
)
language sql
stable
security definer
as $$
  with owned as (
    select id from public.properties p where p.deleted_at is null and p.created_by_user_id = auth_uid
  ),
  access as (
    select id from public.properties p
    where p.deleted_at is null
      and (p.public_visibility = true or public.can_view_property(p.id))
      and (
        p.created_by_user_id = auth_uid
        or exists (
          select 1 from public.property_stakeholders ps where ps.property_id = p.id and ps.user_id = auth_uid and ps.deleted_at is null
        )
      )
  )
  select
    (select count(*) from owned) as owned_properties,
    (select count(*) from access) as accessible_properties,
    coalesce((select count(*) from public.documents d where d.property_id in (select id from access) and d.deleted_at is null), 0) as total_documents,
    coalesce((select count(*) from public.media m where m.property_id in (select id from access) and m.deleted_at is null), 0) as total_media;
$$;
grant execute on function public.get_dashboard_stats(uuid) to authenticated;

drop function if exists public.calculate_property_completion(uuid) cascade;
create or replace function public.calculate_property_completion(
  property_id uuid
)
returns integer
language sql
stable
security definer
as $$
  with metrics as (
    select
      (p.display_address is not null and p.uprn is not null)::int as has_basic_details,
      (select (count(*) > 0)::int from public.documents d where d.property_id = p.id and d.deleted_at is null) as has_documents,
      (select (count(*) > 0)::int from public.media m where m.property_id = p.id and m.deleted_at is null) as has_media,
      (select (count(*) > 0)::int from public.property_stakeholders ps where ps.property_id = p.id and ps.deleted_at is null) as has_roles,
      (select (count(*) > 0)::int from public.property_events e where e.property_id = p.id) as has_events
    from public.properties p
    where p.id = calculate_property_completion.property_id
  )
  select least(
    100,
    (has_basic_details * 25) +
    (has_documents * 25) +
    (has_media * 25) +
    (has_roles * 10) +
    (has_events * 15)
  )::integer
  from metrics;
$$;
grant execute on function public.calculate_property_completion(uuid) to authenticated;

drop function if exists public.get_public_property(text) cascade;
create or replace function public.get_public_property(
  slug text
)
returns table (
  id uuid,
  display_address text,
  uprn text,
  status text,
  featured_media_path text,
  gallery_paths text[],
  public_documents text[]
)
language sql
stable
security definer
as $$
  select
    p.id,
    p.display_address,
    p.uprn,
    p.status,
    (
      select m.storage_path
      from public.media m
      where m.property_id = p.id
        and m.media_type = 'photo'
        and m.status = 'active'
        and m.deleted_at is null
      order by m.created_at asc
      limit 1
    ) as featured_media_path,
    (
      select array_agg(m.storage_path order by m.created_at asc)
      from public.media m
      where m.property_id = p.id
        and m.media_type in ('photo', 'floorplan')
        and m.status = 'active'
        and m.deleted_at is null
    ) as gallery_paths,
    (
      select array_agg(d.storage_path)
      from public.documents d
      where d.property_id = p.id
        and d.status = 'active'
        and d.deleted_at is null
    ) as public_documents
  from public.properties p
  where p.public_slug = get_public_property.slug
    and p.public_visibility = true
    and p.deleted_at is null;
$$;
grant execute on function public.get_public_property(text) to anon, authenticated;

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
  if not (public.is_property_owner(property_id) or public.is_admin()) then
    raise exception 'Not authorized to change visibility';
  end if;

  update public.properties
    set public_visibility = visible,
        updated_at = now()
  where id = property_id;
end;
$$;
grant execute on function public.set_public_visibility(uuid, boolean) to authenticated;

-- Grant/revoke roles
drop function if exists public.grant_property_role(uuid, uuid, public.property_role_type, timestamptz) cascade;
create or replace function public.grant_property_role(
  target_user_id uuid,
  property_id uuid,
  role public.property_role_type,
  expires_at timestamptz default null
)
returns void
language plpgsql
security definer
as $$
begin
  if not (public.is_property_owner(property_id) or public.is_admin()) then
    raise exception 'Not authorized to grant roles';
  end if;

  if role not in ('editor','viewer','owner') then
    raise exception 'Invalid role';
  end if;

  insert into public.property_stakeholders (user_id, property_id, role, granted_by_user_id, granted_at, expires_at, created_at, updated_at)
  values (target_user_id, property_id, role, auth.uid(), now(), expires_at, now(), now())
  on conflict (user_id, property_id, role) do update
    set expires_at = excluded.expires_at,
        deleted_at = null,
        updated_at = now();
end;
$$;
grant execute on function public.grant_property_role(uuid, uuid, public.property_role_type, timestamptz) to authenticated;

drop function if exists public.revoke_property_role(uuid, uuid, public.property_role_type) cascade;
create or replace function public.revoke_property_role(
  target_user_id uuid,
  property_id uuid,
  role public.property_role_type
)
returns void
language plpgsql
security definer
as $$
declare
  owner_count int;
begin
  if not (public.is_property_owner(property_id) or public.is_admin()) then
    raise exception 'Not authorized to revoke roles';
  end if;

  if role = 'owner' then
    select count(*) into owner_count
    from public.property_stakeholders
    where property_id = revoke_property_role.property_id
      and role = 'owner'
      and deleted_at is null;

    if owner_count <= 1 then
      raise exception 'Cannot remove the last owner';
    end if;
  end if;

  update public.property_stakeholders
  set deleted_at = now(),
      updated_at = now()
  where user_id = target_user_id
    and property_id = property_id
    and role = role
    and deleted_at is null;
end;
$$;
grant execute on function public.revoke_property_role(uuid, uuid, public.property_role_type) to authenticated;

-- Invitations
drop function if exists public.invite_user_to_property(uuid, text, public.property_role_type, timestamptz) cascade;
create or replace function public.invite_user_to_property(
  property_id uuid,
  email text,
  role public.property_role_type,
  expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_token uuid := gen_random_uuid();
  v_invitation_id uuid;
begin
  if not public.can_invite(property_id) then
    raise exception 'Not authorized to invite';
  end if;

  insert into public.invitations (id, property_id, email, role, token, status, expires_at, created_at, updated_at)
  values (gen_random_uuid(), property_id, email, role, v_token::text, 'pending', expires_at, now(), now())
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$$;
grant execute on function public.invite_user_to_property(uuid, text, public.property_role_type, timestamptz) to authenticated;

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

  perform public.grant_property_role(v_user_id, v_inv.property_id, v_inv.role, v_inv.expires_at);
end;
$$;
grant execute on function public.accept_invitation(text) to authenticated;

-- ============================================================================
-- RLS Policies (recreate for v7 role model)
-- ============================================================================

-- PROFILES
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using (user_id = auth.uid() or public.is_admin() or public.is_service_role());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (user_id = auth.uid() or public.is_admin() or public.is_service_role());

-- PROPERTIES
drop policy if exists properties_owner_rw on public.properties;
drop policy if exists properties_stakeholder_read on public.properties;
create policy properties_read on public.properties for select
  using (public.can_view_property(id));
create policy properties_write on public.properties for all
  using (public.can_edit_property(id));

-- PROPERTY STAKEHOLDERS
drop policy if exists stakeholders_read on public.property_stakeholders;
drop policy if exists stakeholders_manage on public.property_stakeholders;
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
drop policy if exists documents_owner_insert on public.documents;
drop policy if exists documents_owner_update on public.documents;
drop policy if exists documents_owner_delete on public.documents;
create policy documents_read on public.documents for select
  using (public.can_view_property(property_id));
create policy documents_write on public.documents for all
  using (public.can_upload(property_id))
  with check (public.can_upload(property_id));

-- MEDIA
drop policy if exists media_read on public.media;
drop policy if exists media_insert on public.media;
drop policy if exists media_update on public.media;
drop policy if exists media_delete on public.media;
create policy media_read on public.media for select
  using (public.can_view_property(property_id));
create policy media_write on public.media for all
  using (public.can_upload(property_id))
  with check (public.can_upload(property_id));

-- TASKS
drop policy if exists tasks_read on public.tasks;
drop policy if exists tasks_insert on public.tasks;
drop policy if exists tasks_update on public.tasks;
drop policy if exists tasks_delete on public.tasks;
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
drop policy if exists invitations_insert on public.invitations;
drop policy if exists invitations_delete on public.invitations;
create policy invitations_read on public.invitations for select
  using (
    public.can_invite(property_id)
    or email = (select email from public.users u where u.id = auth.uid())
  );
create policy invitations_write on public.invitations for all
  using (public.can_invite(property_id))
  with check (public.can_invite(property_id));

-- NOTIFICATIONS / ACTIVITY LOG (unchanged but ensure admin/service)
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select
  using (user_id = auth.uid() or public.is_admin() or public.is_service_role());

drop policy if exists activity_log_admin_read on public.activity_log;
create policy activity_log_admin_read on public.activity_log for select
  using (public.is_admin() or public.is_service_role());
