-- Fix: ensure set_public_visibility RPC uses PL/pgSQL so typegen captures args
-- Converts the function from SQL to PL/pgSQL with explicit parameter metadata

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
