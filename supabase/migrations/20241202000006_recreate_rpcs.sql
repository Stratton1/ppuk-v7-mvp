-- Canonical RPC recreation (PL/pgSQL with explicit parameters and security definer)

-- 1) Featured media
create or replace function public.get_featured_media(
  property_id uuid
)
returns table (
  id uuid,
  storage_path text
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select pm.id, pm.storage_path
  from public.property_media pm
  where pm.property_id = get_featured_media.property_id
    and pm.media_type = 'photo'
    and pm.status = 'active'
    and pm.deleted_at is null
  order by pm.created_at asc
  limit 1;
end;
$$;

grant execute on function public.get_featured_media(uuid) to authenticated, anon;


-- 2) Create property with event (and owner role)
create or replace function public.create_property_with_event(
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
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required to create property';
  end if;

  if p_status not in ('draft', 'active', 'archived', 'withdrawn') then
    raise exception 'Invalid status. Must be draft, active, archived, or withdrawn';
  end if;

  insert into public.properties (
    id,
    uprn,
    display_address,
    latitude,
    longitude,
    status,
    created_by_user_id,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    p_uprn,
    p_display_address,
    p_latitude,
    p_longitude,
    p_status,
    v_user_id,
    now(),
    now()
  )
  returning id into v_property_id;

  insert into public.user_property_roles (
    id,
    user_id,
    property_id,
    role,
    granted_by_user_id,
    granted_at,
    expires_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    v_user_id,
    v_property_id,
    'owner',
    null,
    now(),
    null,
    now(),
    now()
  );

  insert into public.property_events (
    id,
    property_id,
    actor_user_id,
    event_type,
    event_payload,
    created_at,
    updated_at
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

grant execute on function public.create_property_with_event(text, text, numeric, numeric, text) to authenticated;


-- 3) Update property with event logging
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
as $$
declare
  v_user_id uuid := auth.uid();
  v_old_record record;
  v_changes jsonb := '{}'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required to update property';
  end if;

  if p_status not in ('draft', 'active', 'archived', 'withdrawn') then
    raise exception 'Invalid status value: %. Must be one of: draft, active, archived, withdrawn', p_status;
  end if;

  select * into v_old_record
  from public.properties
  where id = p_property_id;

  if not found then
    raise exception 'Property not found: %', p_property_id;
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

  if jsonb_typeof(v_changes) = 'object' and jsonb_object_keys(v_changes) is not null then
    insert into public.property_events (property_id, event_type, actor_user_id, event_payload, created_at, updated_at)
    values (
      p_property_id,
      'status_changed',
      v_user_id,
      jsonb_build_object(
        'action', 'updated',
        'changes', v_changes,
        'updated_at', now()
      ),
      now(),
      now()
    );
  end if;

  return p_property_id;
end;
$$;

grant execute on function public.update_property_with_event(uuid, text, text, numeric, numeric, text) to authenticated;


-- 4) Search properties
create or replace function public.search_properties(
  query_text text,
  result_limit int default 50
)
returns table (
  id uuid,
  uprn text,
  display_address text,
  latitude numeric,
  longitude numeric,
  status text,
  created_at timestamptz,
  relevance_score int
)
language plpgsql
security definer
stable
as $$
begin
  query_text := lower(trim(query_text));

  if length(query_text) < 2 then
    return;
  end if;

  return query
  select
    p.id,
    p.uprn,
    p.display_address,
    p.latitude,
    p.longitude,
    p.status,
    p.created_at,
    case
      when lower(p.uprn) = query_text then 1000
      when lower(p.uprn) like query_text || '%' then 900
      when lower(split_part(p.display_address, ',', -1)) = query_text then 800
      when lower(split_part(p.display_address, ',', -1)) like query_text || '%' then 700
      when lower(p.display_address) like '% ' || query_text || ' %' then 600
      when lower(p.display_address) like query_text || ' %' then 590
      when lower(p.display_address) like '% ' || query_text then 580
      when lower(p.display_address) like '%' || query_text || '%' then 500
      else 0
    end as relevance_score
  from public.properties p
  where p.deleted_at is null
    and (
      lower(p.uprn) like '%' || query_text || '%'
      or lower(p.display_address) like '%' || query_text || '%'
    )
  order by
    relevance_score desc,
    case p.status
      when 'active' then 1
      when 'draft' then 2
      when 'archived' then 3
      else 4
    end,
    p.created_at desc
  limit result_limit;
end;
$$;

grant execute on function public.search_properties(text, int) to authenticated, anon;


-- 5) has_property_role
create or replace function public.has_property_role(
  property_id uuid,
  allowed_roles text[]
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return exists (
    select 1
    from public.user_property_roles
    where user_id = auth.uid()
      and user_property_roles.property_id = has_property_role.property_id
      and role = any(allowed_roles)
      and deleted_at is null
      and (expires_at is null or expires_at > now())
  );
end;
$$;

grant execute on function public.has_property_role(uuid, text[]) to authenticated;


-- 6) can_access_document
create or replace function public.can_access_document(
  document_id uuid
)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  doc_property_id uuid;
  doc_type text;
  doc_status text;
begin
  select property_id, document_type, status
  into doc_property_id, doc_type, doc_status
  from public.property_documents
  where id = can_access_document.document_id;

  if doc_property_id is null then
    return false;
  end if;

  if doc_status = 'archived' then
    return public.is_admin() or public.is_property_owner(doc_property_id);
  end if;

  if public.is_admin() then
    return true;
  end if;

  if public.is_property_owner(doc_property_id) then
    return true;
  end if;

  if public.has_property_role(doc_property_id, array['conveyancer']) then
    return doc_type in ('title', 'survey', 'search', 'identity', 'contract', 'compliance');
  end if;

  if public.has_property_role(doc_property_id, array['surveyor']) then
    return doc_type in ('survey', 'planning', 'compliance', 'warranty');
  end if;

  if public.has_property_role(doc_property_id, array['agent']) then
    return doc_type in ('survey', 'planning', 'warranty');
  end if;

  if public.has_property_role(doc_property_id, array['buyer']) then
    return doc_type in ('survey', 'planning', 'warranty');
  end if;

  if public.has_property_role(doc_property_id, array['tenant']) then
    return doc_type in ('compliance', 'warranty');
  end if;

  return false;
end;
$$;

grant execute on function public.can_access_document(uuid) to authenticated;


-- 7) get_property_tasks
create or replace function public.get_property_tasks(
  property_id uuid
)
returns setof public.property_tasks
language plpgsql
security definer
stable
as $$
begin
  return query
  select *
  from public.property_tasks
  where property_id = get_property_tasks.property_id;
end;
$$;

grant execute on function public.get_property_tasks(uuid) to authenticated;


-- 8) get_property_notes
create or replace function public.get_property_notes(
  property_id uuid
)
returns setof public.property_notes
language plpgsql
security definer
stable
as $$
begin
  return query
  select *
  from public.property_notes
  where property_id = get_property_notes.property_id
  order by pinned desc, created_at desc;
end;
$$;

grant execute on function public.get_property_notes(uuid) to authenticated;


-- 9) calculate_property_completion
create or replace function public.calculate_property_completion(
  property_id uuid
)
returns integer
language plpgsql
security definer
stable
as $$
begin
  return (
    with metrics as (
      select
        (p.display_address is not null and p.uprn is not null)::int as has_basic_details,
        (select (count(*) > 0)::int from public.property_documents d where d.property_id = p.id and d.deleted_at is null) as has_documents,
        (select (count(*) > 0)::int from public.property_media m where m.property_id = p.id and m.deleted_at is null) as has_photos,
        (select (count(*) > 0)::int from public.user_property_roles r where r.property_id = p.id and r.deleted_at is null) as has_roles,
        (select (count(*) = 0)::int from public.property_flags f where f.property_id = p.id and f.status not in ('resolved','dismissed') and f.deleted_at is null) as flags_resolved,
        (select (count(*) > 0)::int from public.property_events e where e.property_id = p.id) as has_events,
        (case when p.status = 'active' then 1 else 0 end) as ownership_verified
      from public.properties p
      where p.id = property_id
    )
    select least(
      100,
      (has_basic_details * 20) +
      (has_documents * 20) +
      (has_photos * 20) +
      (has_roles * 10) +
      (flags_resolved * 10) +
      (has_events * 5) +
      (ownership_verified * 15)
    )::integer
    from metrics
  );
end;
$$;

grant execute on function public.calculate_property_completion(uuid) to authenticated;


-- 10) get_user_properties
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
  created_at timestamptz,
  featured_media_id uuid,
  featured_media_storage_path text,
  featured_media_mime_type text
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    p.id as property_id,
    r.role,
    r.expires_at as access_expires_at,
    p.display_address,
    p.uprn,
    p.status,
    p.latitude,
    p.longitude,
    p.created_at,
    m.id as featured_media_id,
    m.storage_path as featured_media_storage_path,
    m.mime_type as featured_media_mime_type
  from public.user_property_roles r
  inner join public.properties p on p.id = r.property_id
  left join lateral (
    select id, storage_path, mime_type
    from public.property_media
    where property_id = p.id
      and media_type = 'photo'
      and status = 'active'
      and deleted_at is null
    order by created_at asc
    limit 1
  ) m on true
  where r.user_id = get_user_properties.user_id
    and r.deleted_at is null
    and p.deleted_at is null
  order by
    case r.role
      when 'owner' then 1
      when 'admin' then 2
      when 'agent' then 3
      when 'surveyor' then 4
      when 'conveyancer' then 5
      when 'buyer' then 6
      when 'tenant' then 7
      when 'viewer' then 8
      else 9
    end,
    p.created_at desc;
end;
$$;

grant execute on function public.get_user_properties(uuid) to authenticated;


-- 11) get_recent_activity
create or replace function public.get_recent_activity(
  auth_uid uuid
)
returns table (
  property_id uuid,
  property_address text,
  event_type text,
  created_at timestamptz
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    e.property_id,
    p.display_address as property_address,
    e.event_type,
    e.created_at
  from public.property_events e
  join public.properties p on p.id = e.property_id and p.deleted_at is null
  where (
    p.created_by_user_id = get_recent_activity.auth_uid
    or exists (
      select 1 from public.user_property_roles upr
      where upr.property_id = p.id
        and upr.user_id = get_recent_activity.auth_uid
        and upr.deleted_at is null
    )
  )
  order by e.created_at desc
  limit 100;
end;
$$;

grant execute on function public.get_recent_activity(uuid) to authenticated;


-- 12) get_dashboard_stats
create or replace function public.get_dashboard_stats(
  auth_uid uuid
)
returns table (
  owned_properties integer,
  accessible_properties integer,
  unresolved_flags integer,
  total_documents integer,
  total_media integer
)
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    (select count(*) from public.properties p where p.created_by_user_id = get_dashboard_stats.auth_uid and p.deleted_at is null) as owned_properties,
    (
      select count(*) from public.properties p
      where p.deleted_at is null
        and (
          p.created_by_user_id = get_dashboard_stats.auth_uid
          or exists (select 1 from public.user_property_roles upr where upr.property_id = p.id and upr.user_id = get_dashboard_stats.auth_uid and upr.deleted_at is null)
        )
    ) as accessible_properties,
    (
      select count(*) from public.property_flags f
      where f.status not in ('resolved','dismissed') and f.deleted_at is null
        and (
          f.created_by_user_id = get_dashboard_stats.auth_uid
          or exists (select 1 from public.user_property_roles upr where upr.property_id = f.property_id and upr.user_id = get_dashboard_stats.auth_uid and upr.deleted_at is null)
        )
    ) as unresolved_flags,
    (
      select count(*) from public.property_documents d
      where d.deleted_at is null
        and exists (
          select 1 from public.properties p
          where p.id = d.property_id and p.deleted_at is null
            and (
              p.created_by_user_id = get_dashboard_stats.auth_uid
              or exists (select 1 from public.user_property_roles upr where upr.property_id = p.id and upr.user_id = get_dashboard_stats.auth_uid and upr.deleted_at is null)
            )
        )
    ) as total_documents,
    (
      select count(*) from public.property_media m
      where m.deleted_at is null
        and exists (
          select 1 from public.properties p
          where p.id = m.property_id and p.deleted_at is null
            and (
              p.created_by_user_id = get_dashboard_stats.auth_uid
              or exists (select 1 from public.user_property_roles upr where upr.property_id = p.id and upr.user_id = get_dashboard_stats.auth_uid and upr.deleted_at is null)
            )
        )
    ) as total_media;
end;
$$;

grant execute on function public.get_dashboard_stats(uuid) to authenticated;


-- 13) get_public_property
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
language plpgsql
security definer
stable
as $$
begin
  return query
  select
    p.id,
    p.display_address,
    p.uprn,
    p.status,
    (
      select pm.storage_path
      from public.property_media pm
      where pm.property_id = p.id
        and pm.media_type = 'photo'
        and pm.status = 'active'
        and pm.deleted_at is null
      order by pm.created_at asc
      limit 1
    ) as featured_media_path,
    (
      select array_agg(pm.storage_path)
      from public.property_media pm
      where pm.property_id = p.id
        and pm.media_type in ('photo', 'floorplan')
        and pm.status = 'active'
        and pm.deleted_at is null
    ) as gallery_paths,
    (
      select array_agg(pd.storage_path)
      from public.property_documents pd
      where pd.property_id = p.id
        and pd.document_type in ('epc', 'floorplan')
        and pd.status = 'active'
        and pd.deleted_at is null
    ) as public_documents
  from public.properties p
  where p.public_slug = get_public_property.slug
    and p.public_visibility = true
    and p.deleted_at is null;
end;
$$;

grant execute on function public.get_public_property(text) to anon, authenticated;


-- 14) set_public_visibility
create or replace function public.set_public_visibility(
  property_id uuid,
  visible boolean
)
returns void
language plpgsql
security definer
as $$
begin
  update public.properties
  set public_visibility = visible
  where id = property_id;
end;
$$;

grant execute on function public.set_public_visibility(uuid, boolean) to authenticated;


-- 15) regenerate_slug
create or replace function public.regenerate_slug(
  property_id uuid
)
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
