-- Migration: Update Search Properties RPC with FTS and Pagination
-- Purpose: Enhance search_properties RPC with full-text search and pagination support
-- Date: 2025-03-23
--
-- This migration updates the search_properties RPC to:
-- 1. Use PostgreSQL full-text search (FTS) via tsvector for better relevance
-- 2. Add pagination support (offset-based for simplicity)
-- 3. Keep UPRN exact match fallback for precise lookups
-- 4. Return total count for pagination UI

-- ============================================================================
-- Updated RPC Function: search_properties
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_properties(
  query_text text,
  result_limit int DEFAULT 50,
  result_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  uprn text,
  display_address text,
  latitude numeric,
  longitude numeric,
  status text,
  created_at timestamptz,
  relevance_score int,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  total_results bigint;
BEGIN
  -- Normalize query
  query_text := lower(trim(query_text));
  
  -- Return empty if query too short
  IF length(query_text) < 2 THEN
    RETURN;
  END IF;

  -- Get total count for pagination
  SELECT COUNT(*) INTO total_results
  FROM public.properties p
  WHERE
    p.deleted_at IS NULL
    AND (
      -- FTS match
      p.search_vector @@ plainto_tsquery('english', query_text)
      OR
      -- UPRN exact/partial match (fallback for precise lookups)
      lower(p.uprn) LIKE '%' || query_text || '%'
      OR
      -- Address ILIKE fallback (for edge cases)
      lower(p.display_address) LIKE '%' || query_text || '%'
    );

  -- Search with FTS and relevance scoring
  RETURN QUERY
    SELECT
      p.id,
      p.uprn,
      p.display_address,
      p.latitude,
      p.longitude,
      p.status,
      p.created_at,
      -- Relevance scoring (higher = better match)
      CASE
        -- Exact UPRN match: highest priority
        WHEN lower(p.uprn) = query_text THEN 1000
        -- UPRN starts with query
        WHEN lower(p.uprn) LIKE query_text || '%' THEN 900
        -- FTS rank (multiply by 10 to scale to similar range)
        WHEN p.search_vector @@ plainto_tsquery('english', query_text) 
          THEN (ts_rank(p.search_vector, plainto_tsquery('english', query_text)) * 100)::int
        -- Exact postcode match (extract from display_address)
        WHEN lower(split_part(p.display_address, ',', -1)) = query_text THEN 800
        -- Postcode starts with query
        WHEN lower(split_part(p.display_address, ',', -1)) LIKE query_text || '%' THEN 700
        -- Address contains query (word boundary)
        WHEN lower(p.display_address) LIKE '% ' || query_text || ' %' THEN 600
        WHEN lower(p.display_address) LIKE query_text || ' %' THEN 590
        WHEN lower(p.display_address) LIKE '% ' || query_text THEN 580
        -- Fuzzy address match (contains anywhere)
        WHEN lower(p.display_address) LIKE '%' || query_text || '%' THEN 500
        ELSE 0
      END as relevance_score,
      total_results as total_count
    FROM public.properties p
    WHERE
      -- Only non-deleted properties
      p.deleted_at IS NULL
      AND (
        -- FTS match (primary search method)
        p.search_vector @@ plainto_tsquery('english', query_text)
        OR
        -- UPRN exact/partial match (fallback)
        lower(p.uprn) LIKE '%' || query_text || '%'
        OR
        -- Address ILIKE fallback (for edge cases where FTS doesn't match)
        lower(p.display_address) LIKE '%' || query_text || '%'
      )
    ORDER BY
      -- Order by relevance score (descending)
      relevance_score DESC,
      -- Then by status (active first)
      CASE p.status
        WHEN 'active' THEN 1
        WHEN 'draft' THEN 2
        WHEN 'archived' THEN 3
        ELSE 4
      END,
      -- Then by created date (newest first)
      p.created_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.search_properties(text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_properties(text, int, int) TO anon;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION public.search_properties(text, int, int) IS 
'Search properties using full-text search (FTS) with pagination support. Returns properties matching query_text with relevance scoring. Supports offset-based pagination.';

-- ============================================================================
-- End of Search Properties FTS Pagination Migration
-- ============================================================================

