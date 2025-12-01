-- PPUK v7 Backend Alignment - Remove legacy v6 constructs, rebuild RPCs/RLS helpers
-- This migration drops legacy functions/tables tied to v6 schema and recreates
-- RPCs and helpers against the v7 model (media/documents/property_stakeholders/users).

-- ============================================================================
-- Safety: drop legacy tables (no-op if already removed) and functions
-- ============================================================================

drop table if exists public.property_media cascade;
drop table if exists public.property_documents cascade;
drop table if exists public.property_tasks cascade;
drop table if exists public.property_notes cascade;
drop table if exists public.user_property_roles cascade;
drop table if exists public.users_extended cascade;

drop function if exists public.get_featured_media(uuid) cascade;
drop function if exists public.get_property_tasks(uuid) cascade;
drop function if exists public.get_property_notes(uuid) cascade;
drop function if exists public.can_access_document(uuid) cascade;
drop function if exists public.get_public_property(text) cascade;
drop function if exists public.search_properties(text, integer) cascade;
drop function if exists public.search_properties(text) cascade;
drop function if exists public.create_property_with_event(text, text, numeric, numeric, text) cascade;
drop function if exists public.update_property_with_event(uuid, text, text, numeric, numeric, text) cascade;
drop function if exists public.create_property_with_role(text, text, numeric, numeric, text) cascade;
drop function if exists public.get_user_properties(uuid) cascade;
drop function if exists public.get_recent_activity(uuid) cascade;
drop function if exists public.get_dashboard_stats(uuid) cascade;
drop function if exists public.calculate_property_completion(uuid) cascade;
drop function if exists public.set_public_visibility(uuid, boolean) cascade;
drop function if exists public.regenerate_slug(uuid) cascade;
drop function if exists public.has_property_role(uuid, text[]) cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.get_user_property_roles(uuid) cascade;

-- ============================================================================
-- Helpers
-- ============================================================================

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
    or exists (
      select 1
      from public.properties p
      where p.id = has_property_role.property_id
        and p.created_by_user_id = auth.uid()
        and 'owner' = any(allowed_roles)
        and p.deleted_at is null
    )
    or exists (
      select 1
      from public.property_stakeholders ps
      where ps.property_id = has_property_role.property_id
        and ps.user_id = auth.uid()
        and ps.role = any(allowed_roles::public.role_type[])
        and ps.deleted_at is null
        and (ps.expires_at is null or ps.expires_at > now())
    );
$$;

grant execute on function public.has_property_role(uuid, text[]) to authenticated;

-- ============================================================================
-- Slug + visibility helpers
-- ============================================================================

create or replace function public.regenerate_slug(property_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  select regexp_replace(lower(trim(display_address)), '[^a-z0-9]+', '-', 'g')
    into base_slug
  from public.properties
  where id = property_id;

  if base_slug is null or base_slug = '' then
    base_slug := substring(property_id::text from 1 for 8);
  end if;

  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  while exists (select 1 from public.properties where public_slug = final_slug and id <> property_id) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  update public.properties
    set public_slug = final_slug
  where id = property_id;

  return final_slug;
end;
$$;

grant execute on function public.regenerate_slug(uuid) to authenticated, anon;

create or replace function public.set_public_visibility(property_id uuid, visible boolean)
returns void
language plpgsql
security definer
as $$
begin
  if not (public.is_service_role() or public.has_property_role(property_id, array['owner'])) then
    raise exception 'Not authorized to change visibility';
  end if;

  update public.properties
    set public_visibility = visible
  where id = property_id;
end;
$$;

grant execute on function public.set_public_visibility(uuid, boolean) to authenticated;

-- ============================================================================
-- RPCs (v7 schema)
-- ============================================================================

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
    created_by_user_id, created_at, updated_at
  )
  values (
    gen_random_uuid(), p_uprn, p_display_address, p_latitude, p_longitude, p_status,
    v_user_id, now(), now()
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
    jsonb_build_object(
      'created_source', 'manual_form',
      'uprn', p_uprn,
      'address', p_display_address,
      'initial_status', p_status
    ),
    now(),
    now()
  );

  return v_property_id;
end;
$$;

grant execute on function public.create_property_with_role(text, text, numeric, numeric, text) to authenticated;

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
  v_old_record record;
  v_changes jsonb := '{}'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required to update property';
  end if;

  if not public.has_property_role(p_property_id, array['owner']) then
    raise exception 'Not authorized to update property';
  end if;

  select * into v_old_record
  from public.properties
  where id = p_property_id
    and deleted_at is null;

  if not found then
    raise exception 'Property not found: %', p_property_id;
  end if;

  if p_status not in ('draft', 'active', 'archived') then
    raise exception 'Invalid status value: %. Must be one of: draft, active, archived', p_status;
  end if;

  if v_old_record.uprn is distinct from p_uprn then
    v_changes := v_changes || jsonb_build_object(
      'uprn', jsonb_build_object('before', v_old_record.uprn, 'after', p_uprn)
    );
  end if;

  if v_old_record.display_address is distinct from p_display_address then
    v_changes := v_changes || jsonb_build_object(
      'display_address', jsonb_build_object('before', v_old_record.display_address, 'after', p_display_address)
    );
  end if;

  if v_old_record.latitude is distinct from p_latitude then
    v_changes := v_changes || jsonb_build_object(
      'latitude', jsonb_build_object('before', v_old_record.latitude, 'after', p_latitude)
    );
  end if;

  if v_old_record.longitude is distinct from p_longitude then
    v_changes := v_changes || jsonb_build_object(
      'longitude', jsonb_build_object('before', v_old_record.longitude, 'after', p_longitude)
    );
  end if;

  if v_old_record.status is distinct from p_status then
    v_changes := v_changes || jsonb_build_object(
      'status', jsonb_build_object('before', v_old_record.status, 'after', p_status)
    );
  end if;

  update public.properties
  set uprn = p_uprn,
      display_address = p_display_address,
      latitude = p_latitude,
      longitude = p_longitude,
      status = p_status,
      updated_at = now()
  where id = p_property_id;

  insert into public.property_events (property_id, event_type, actor_user_id, event_payload, created_at, updated_at)
  values (
    p_property_id,
    'updated',
    v_user_id,
    jsonb_build_object(
      'action', 'updated',
      'changes', v_changes,
      'updated_at', now()
    ),
    now(),
    now()
  );

  return p_property_id;
end;
$$;

grant execute on function public.update_property_with_event(uuid, text, text, numeric, numeric, text) to authenticated;

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
  with filtered as (
    select *
    from public.properties p
    where p.deleted_at is null
      and (
        p.public_visibility = true
        or (auth.uid() is not null and (p.created_by_user_id = auth.uid() or exists (
          select 1 from public.property_stakeholders ps
          where ps.property_id = p.id and ps.user_id = auth.uid() and ps.deleted_at is null
        )))
      )
      and (
        p.display_address ilike '%' || query_text || '%'
        or p.uprn ilike '%' || query_text || '%'
      )
  )
  select
    id,
    display_address,
    uprn,
    status,
    latitude,
    longitude
  from filtered
  order by display_address asc
  limit result_limit;
$$;

grant execute on function public.search_properties(text, integer) to authenticated, anon;

create or replace function public.get_user_properties(
  user_id uuid default auth.uid()
)
returns table (
  property_id uuid,
  role text,
  access_expires_at timestamptz,
  display_address text,
  uprn text,
  status text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz
)
language sql
stable
security definer
as $$
  with access as (
    select
      p.id as property_id,
      'owner'::text as role,
      null::timestamptz as access_expires_at,
      p.display_address,
      p.uprn,
      p.status,
      p.latitude,
      p.longitude,
      p.created_at
    from public.properties p
    where p.created_by_user_id = get_user_properties.user_id
      and p.deleted_at is null
    union all
    select
      ps.property_id,
      ps.role::text,
      ps.expires_at,
      p.display_address,
      p.uprn,
      p.status,
      p.latitude,
      p.longitude,
      p.created_at
    from public.property_stakeholders ps
    join public.properties p on p.id = ps.property_id
    where ps.user_id = get_user_properties.user_id
      and ps.deleted_at is null
      and p.deleted_at is null
  )
  select distinct on (property_id)
    property_id,
    role,
    access_expires_at,
    display_address,
    uprn,
    status,
    latitude,
    longitude,
    created_at
  from access
  order by property_id, case when role = 'owner' then 1 else 2 end, coalesce(access_expires_at, 'infinity');
$$;

grant execute on function public.get_user_properties(uuid) to authenticated;

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
    select id from public.properties p
    where p.deleted_at is null
      and (
        p.created_by_user_id = auth_uid
        or exists (
          select 1 from public.property_stakeholders ps
          where ps.property_id = p.id
            and ps.user_id = auth_uid
            and ps.deleted_at is null
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

create or replace function public.get_dashboard_stats(
  auth_uid uuid default auth.uid()
)
returns table (
  owned_properties integer,
  accessible_properties integer,
  unresolved_flags integer,
  total_documents integer,
  total_media integer
)
language sql
stable
security definer
as $$
  with access as (
    select id from public.properties p
    where p.deleted_at is null
      and (
        p.created_by_user_id = auth_uid
        or exists (
          select 1 from public.property_stakeholders ps
          where ps.property_id = p.id
            and ps.user_id = auth_uid
            and ps.deleted_at is null
        )
      )
  ),
  owned as (
    select id from public.properties p
    where p.deleted_at is null and p.created_by_user_id = auth_uid
  )
  select
    (select count(*) from owned) as owned_properties,
    (select count(*) from access) as accessible_properties,
    0 as unresolved_flags,
    coalesce((select count(*) from public.documents d where d.property_id in (select id from access) and d.deleted_at is null), 0) as total_documents,
    coalesce((select count(*) from public.media m where m.property_id in (select id from access) and m.deleted_at is null), 0) as total_media;
$$;

grant execute on function public.get_dashboard_stats(uuid) to authenticated;

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
