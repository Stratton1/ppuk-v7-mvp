-- Migration: API Cache Table
-- Purpose: Create table for caching external API responses
-- Date: 2025-03-25
--
-- This migration creates the api_cache table to store responses from external APIs
-- (EPC, HMLR, Flood Risk, Crime Data, Planning) with TTL and expiration management.
-- This reduces external API calls and improves response times.

-- ============================================================================
-- Create API Cache Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  api_provider TEXT NOT NULL CHECK (api_provider IN ('epc', 'hmlr', 'flood', 'crime', 'planning', 'postcodes')),
  cache_key TEXT NOT NULL, -- e.g., UPRN, postcode, title_number, coordinates
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  etag TEXT, -- For conditional requests (HTTP ETag)
  request_hash TEXT, -- Hash of request params for deduplication
  response_size_bytes INTEGER,
  error_message TEXT, -- Store errors to avoid retrying immediately
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(api_provider, cache_key)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- For property-based queries
CREATE INDEX IF NOT EXISTS idx_api_cache_property_provider
ON public.api_cache(property_id, api_provider)
WHERE property_id IS NOT NULL;

-- Index for expiration queries
CREATE INDEX IF NOT EXISTS idx_api_cache_expires
ON public.api_cache(expires_at);

-- For cache key lookups
CREATE INDEX IF NOT EXISTS idx_api_cache_key_provider
ON public.api_cache(api_provider, cache_key);

-- For error tracking
CREATE INDEX IF NOT EXISTS idx_api_cache_errors
ON public.api_cache(api_provider, fetched_at)
WHERE error_message IS NOT NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Users can view cached data for properties they can access
CREATE POLICY "api_cache_select"
ON public.api_cache FOR SELECT
TO authenticated
USING (
  property_id IS NULL OR public.can_view_property(property_id)
);

-- Anonymous users can view cached data for public properties only
CREATE POLICY "api_cache_select_anon"
ON public.api_cache FOR SELECT
TO anon
USING (
  property_id IS NULL OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
      AND p.public_visibility = true
      AND p.deleted_at IS NULL
      AND p.status = 'active'
  )
);

-- Only service role can insert/update (via Edge Functions)
CREATE POLICY "api_cache_insert"
ON public.api_cache FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "api_cache_update"
ON public.api_cache FOR UPDATE
TO service_role
USING (true);

-- ============================================================================
-- Helper RPC for Cache Retrieval
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_cached_api_data(
  p_provider TEXT,
  p_cache_key TEXT
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT payload
  FROM public.api_cache
  WHERE api_provider = p_provider
    AND cache_key = p_cache_key
    AND expires_at > NOW()
    AND error_message IS NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_cached_api_data(TEXT, TEXT) TO authenticated, anon;

-- ============================================================================
-- Helper RPC for Cache Invalidation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.invalidate_api_cache(
  p_provider TEXT DEFAULT NULL,
  p_property_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.api_cache
  WHERE
    (p_provider IS NULL OR api_provider = p_provider)
    AND (p_property_id IS NULL OR property_id = p_property_id)
    AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.invalidate_api_cache(TEXT, UUID) TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.api_cache IS 
'Cache table for external API responses (EPC, HMLR, Flood, Crime, Planning). Reduces external API calls and improves response times.';

COMMENT ON COLUMN public.api_cache.cache_key IS 
'Unique identifier for the cached data (e.g., UPRN, postcode, title number, coordinates). Combined with api_provider forms unique constraint.';

COMMENT ON COLUMN public.api_cache.expires_at IS 
'Timestamp when cached data expires. Should be set based on data freshness requirements (EPC: 1 week, Flood: 1 month, etc.).';

COMMENT ON COLUMN public.api_cache.error_message IS 
'If API call failed, store error message here to avoid immediate retries.';

-- ============================================================================
-- End of API Cache Table Migration
-- ============================================================================

