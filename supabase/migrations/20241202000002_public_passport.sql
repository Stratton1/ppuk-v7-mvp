-- Public passport support: columns + RPCs for public access

-- Add public slug + visibility flags
alter table public.properties
  add column if not exists public_slug text unique,
  add column if not exists public_visibility boolean default false;

-- RPC: regenerate slug based on address (ensures uniqueness)
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

-- RPC: set public visibility flag (RLS governs who can change)
create or replace function public.set_public_visibility(property_id uuid, visible boolean)
returns void
language sql
security definer
as $$
  update public.properties
    set public_visibility = visible
  where id = property_id;
$$;

grant execute on function public.set_public_visibility(uuid, boolean) to authenticated;

-- RPC: get public property (safe projection only)
create or replace function public.get_public_property(slug text)
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
  where p.public_slug = slug
    and p.public_visibility = true
    and p.deleted_at is null;
$$;

grant execute on function public.get_public_property(text) to anon, authenticated;
