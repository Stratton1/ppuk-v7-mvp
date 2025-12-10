-- Migration: Property Creation RPC
-- Purpose: Atomic property creation with role assignment and event logging
-- Date: 2024-12-01
-- 
-- This migration creates an RPC function that:
-- 1. Inserts a new property record
-- 2. Auto-assigns the creator as the owner
-- 3. Logs a 'created' event
-- 4. Returns the new property ID
--
-- Security: SECURITY DEFINER allows the function to bypass RLS for inserts
-- Access: Granted to authenticated users only

-- ============================================================================
-- Create Property with Role Assignment and Event Log
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_property_with_role(
  p_uprn TEXT,
  p_display_address TEXT,
  p_latitude NUMERIC DEFAULT NULL,
  p_longitude NUMERIC DEFAULT NULL,
  p_status TEXT DEFAULT 'draft'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create property';
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('draft', 'active', 'archived') THEN
    RAISE EXCEPTION 'Invalid status. Must be: draft, active, or archived';
  END IF;
  
  -- Insert the property
  INSERT INTO public.properties (
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
  VALUES (
    gen_random_uuid(),
    p_uprn,
    p_display_address,
    p_latitude,
    p_longitude,
    p_status,
    v_user_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_property_id;
  
  -- Assign the creator as the owner (permanent access, no expiry)
  INSERT INTO public.user_property_roles (
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
  VALUES (
    gen_random_uuid(),
    v_user_id,
    v_property_id,
    'owner',
    NULL, -- Self-assigned
    NOW(),
    NULL, -- No expiry
    NOW(),
    NOW()
  );
  
  -- Log the property creation event
  INSERT INTO public.property_events (
    id,
    property_id,
    actor_user_id,
    event_type,
    event_payload,
    created_at,
    updated_at
  )
  VALUES (
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
    NOW(),
    NOW()
  );
  
  -- Return the new property ID
  RETURN v_property_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_property_with_role(TEXT, TEXT, NUMERIC, NUMERIC, TEXT) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.create_property_with_role IS 
  'Creates a new property, assigns the creator as owner, and logs the creation event. Returns the new property ID.';

