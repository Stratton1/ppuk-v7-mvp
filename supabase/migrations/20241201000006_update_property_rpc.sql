-- Migration: Update Property RPC with Event Logging
-- Purpose: Create RPC function for updating property details with automatic event logging
-- Date: 2024-12-01
--
-- This migration creates an RPC function that:
-- 1. Updates property fields (address, UPRN, coordinates, status)
-- 2. Logs changes in property_events with before/after diff
-- 3. Returns the updated property ID

-- ============================================================================
-- RPC Function: update_property_with_event
-- ============================================================================

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
  -- 1. Validate authentication
  if v_user_id is null then
    raise exception 'Authentication required to update property';
  end if;

  -- 2. Validate status value
  if p_status not in ('draft', 'active', 'archived', 'withdrawn') then
    raise exception 'Invalid status value: %. Must be one of: draft, active, archived, withdrawn', p_status;
  end if;

  -- 3. Fetch old record for comparison
  select * into v_old_record
  from public.properties
  where id = p_property_id;

  if not found then
    raise exception 'Property not found: %', p_property_id;
  end if;

  -- 4. Build changes object (before/after diff)
  if v_old_record.uprn != p_uprn then
    v_changes := v_changes || jsonb_build_object(
      'uprn', jsonb_build_object(
        'before', v_old_record.uprn,
        'after', p_uprn
      )
    );
  end if;

  if v_old_record.display_address != p_display_address then
    v_changes := v_changes || jsonb_build_object(
      'display_address', jsonb_build_object(
        'before', v_old_record.display_address,
        'after', p_display_address
      )
    );
  end if;

  if v_old_record.latitude is distinct from p_latitude then
    v_changes := v_changes || jsonb_build_object(
      'latitude', jsonb_build_object(
        'before', v_old_record.latitude,
        'after', p_latitude
      )
    );
  end if;

  if v_old_record.longitude is distinct from p_longitude then
    v_changes := v_changes || jsonb_build_object(
      'longitude', jsonb_build_object(
        'before', v_old_record.longitude,
        'after', p_longitude
      )
    );
  end if;

  if v_old_record.status != p_status then
    v_changes := v_changes || jsonb_build_object(
      'status', jsonb_build_object(
        'before', v_old_record.status,
        'after', p_status
      )
    );
  end if;

  -- 5. Update property record
  update public.properties
  set
    uprn = p_uprn,
    display_address = p_display_address,
    latitude = p_latitude,
    longitude = p_longitude,
    status = p_status,
    updated_at = now()
  where id = p_property_id;

  -- 6. Log property_updated event (only if there were changes)
  if jsonb_object_keys(v_changes) is not null then
    insert into public.property_events (property_id, event_type, actor_user_id, event_payload)
    values (
      p_property_id,
      'status_changed', -- Using 'status_changed' as 'property_updated' might not be in schema
      v_user_id,
      jsonb_build_object(
        'action', 'updated',
        'changes', v_changes,
        'updated_at', now()
      )
    );
  end if;

  -- 7. Return property ID
  return p_property_id;
end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function public.update_property_with_event(uuid, text, text, numeric, numeric, text) to authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

comment on function public.update_property_with_event is 'Updates property details and logs changes to property_events table';

