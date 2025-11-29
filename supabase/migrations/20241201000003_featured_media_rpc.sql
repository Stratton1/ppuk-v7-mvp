-- RPC to fetch featured media for a property (first active photo)
create or replace function public.get_featured_media(property_id uuid)
returns table (
  id uuid,
  storage_path text
)
language sql
security definer
as $$
  select pm.id, pm.storage_path
  from public.property_media pm
  where pm.property_id = get_featured_media.property_id
    and pm.media_type = 'photo'
    and pm.status = 'active'
  order by pm.created_at asc
  limit 1;
$$;

grant execute on function public.get_featured_media(uuid) to authenticated, anon;
