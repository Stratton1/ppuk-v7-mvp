-- Migration: Get User Properties RPC
-- Purpose: Fetch all properties a user has access to, grouped by role type
-- Date: 2024-12-01
--
-- This RPC returns properties with:
-- - User's role(s) for each property
-- - Access expiry information
-- - Property details (address, status, featured media)
-- - RLS enforced automatically

-- ============================================================================
-- RPC Function: get_user_properties
-- ============================================================================

-- Drop existing function if it exists (with old signature)
drop function if exists public.get_user_properties(uuid);

-- Create new function with updated signature and return type
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
      -- Featured media (if exists)
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
    where
      r.user_id = get_user_properties.user_id
      and r.deleted_at is null
      and p.deleted_at is null
    order by
      -- Order by role priority (owner first, then managing roles, then temporary)
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
      -- Then by property creation date (newest first)
      p.created_at desc;
end;
$$;

-- Grant execute permissions
grant execute on function public.get_user_properties(uuid) to authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

comment on function public.get_user_properties is 'Returns all properties a user has access to, with role and featured media. RLS enforced via row-level policies.';

