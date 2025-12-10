-- Migration: Batch Property Completion RPC
-- Purpose: Add RPC to batch calculate completion scores for multiple properties
-- Date: 2025-03-22
--
-- This migration adds get_properties_completion RPC that accepts an array of
-- property IDs and returns completion scores for all properties in a single query.
-- This eliminates N+1 queries when loading dashboards with multiple properties.

-- ============================================================================
-- Batch Property Completion RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_properties_completion(
  property_ids uuid[]
)
RETURNS TABLE (
  property_id uuid,
  completion integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH property_metrics AS (
    SELECT
      p.id as property_id,
      (p.display_address IS NOT NULL AND p.uprn IS NOT NULL)::int as has_basic_details,
      (SELECT (count(*) > 0)::int FROM public.documents d WHERE d.property_id = p.id AND d.deleted_at IS NULL) as has_documents,
      (SELECT (count(*) > 0)::int FROM public.media m WHERE m.property_id = p.id AND m.deleted_at IS NULL) as has_media,
      (SELECT (count(*) > 0)::int FROM public.property_stakeholders ps WHERE ps.property_id = p.id AND ps.deleted_at IS NULL) as has_roles,
      (SELECT (count(*) > 0)::int FROM public.property_events e WHERE e.property_id = p.id) as has_events
    FROM public.properties p
    WHERE p.id = ANY(property_ids)
      AND p.deleted_at IS NULL
  )
  SELECT
    property_id,
    LEAST(
      100,
      (has_basic_details * 25) +
      (has_documents * 25) +
      (has_media * 25) +
      (has_roles * 10) +
      (has_events * 15)
    )::integer as completion
  FROM property_metrics;
$$;

GRANT EXECUTE ON FUNCTION public.get_properties_completion(uuid[]) TO authenticated;

COMMENT ON FUNCTION public.get_properties_completion(uuid[]) IS 
'Batch calculate completion scores for multiple properties. Returns property_id and completion score (0-100).';

-- ============================================================================
-- End of Batch Completion RPC Migration
-- ============================================================================

