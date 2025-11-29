-- Dashboard RPCs and completion calculator

create or replace function public.calculate_property_completion(property_id uuid)
returns integer
language sql
stable
as $$
  with metrics as (
    select
      -- boolean flags per weighted section
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
  select
    least(
      100,
      (has_basic_details * 20) +
      (has_documents * 20) +
      (has_photos * 20) +
      (has_roles * 10) +
      (flags_resolved * 10) +
      (has_events * 5) +
      (ownership_verified * 15)
    )::integer
  from metrics;
$$;

-- Note: get_user_properties is now defined in migration 20241201000008_get_user_properties_rpc.sql
-- with an improved signature that includes featured media and access expiry information.
-- This migration only includes calculate_property_completion and other dashboard helpers.

create or replace function public.get_recent_activity(auth_uid uuid)
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
  select
    e.property_id,
    p.display_address as property_address,
    e.event_type,
    e.created_at
  from public.property_events e
  join public.properties p on p.id = e.property_id and p.deleted_at is null
  where (
    p.created_by_user_id = auth_uid
    or exists (
      select 1 from public.user_property_roles upr
      where upr.property_id = p.id
        and upr.user_id = auth_uid
        and upr.deleted_at is null
    )
  )
  order by e.created_at desc
  limit 100;
$$;

create or replace function public.get_dashboard_stats(auth_uid uuid)
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
  select
    (select count(*) from public.properties p where p.created_by_user_id = auth_uid and p.deleted_at is null) as owned_properties,
    (
      select count(*) from public.properties p
      where p.deleted_at is null
        and (
          p.created_by_user_id = auth_uid
          or exists (select 1 from public.user_property_roles upr where upr.property_id = p.id and upr.user_id = auth_uid and upr.deleted_at is null)
        )
    ) as accessible_properties,
    (
      select count(*) from public.property_flags f
      where f.status not in ('resolved','dismissed') and f.deleted_at is null
        and (
          f.created_by_user_id = auth_uid
          or exists (select 1 from public.user_property_roles upr where upr.property_id = f.property_id and upr.user_id = auth_uid and upr.deleted_at is null)
        )
    ) as unresolved_flags,
    (
      select count(*) from public.property_documents d
      where d.deleted_at is null
        and exists (
          select 1 from public.properties p
          where p.id = d.property_id and p.deleted_at is null
            and (
              p.created_by_user_id = auth_uid
              or exists (select 1 from public.user_property_roles upr where upr.property_id = p.id and upr.user_id = auth_uid and upr.deleted_at is null)
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
              p.created_by_user_id = auth_uid
              or exists (select 1 from public.user_property_roles upr where upr.property_id = p.id and upr.user_id = auth_uid and upr.deleted_at is null)
            )
        )
    ) as total_media;
$$;
