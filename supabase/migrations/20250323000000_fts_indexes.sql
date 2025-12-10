-- Migration: Full-Text Search (FTS) Indexes
-- Purpose: Enable PostgreSQL full-text search for property search
-- Date: 2025-03-23
--
-- This migration adds:
-- 1. tsvector column to properties table for FTS
-- 2. GIN index on tsvector for fast FTS queries
-- 3. Trigger to automatically update search_vector on insert/update
-- 4. Backfill existing rows with search vectors
--
-- FTS enables:
-- - Partial word matching (e.g., "Lond" matches "London")
-- - Relevance ranking based on text similarity
-- - Better search performance than ILIKE

-- ============================================================================
-- Add Search Vector Column
-- ============================================================================

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================================================
-- Create Function to Update Search Vector
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_property_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.display_address, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.uprn, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS property_search_vector_update ON public.properties;
CREATE TRIGGER property_search_vector_update
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_property_search_vector();

-- ============================================================================
-- Create GIN Index for FTS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_search_vector
ON public.properties USING GIN(search_vector);

-- ============================================================================
-- Backfill Existing Rows
-- ============================================================================

UPDATE public.properties
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(display_address, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(uprn, '')), 'B')
WHERE search_vector IS NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON COLUMN public.properties.search_vector IS 
'Full-text search vector for address and UPRN. Automatically updated via trigger.';

COMMENT ON INDEX idx_properties_search_vector IS 
'GIN index for fast full-text search queries on property addresses and UPRNs.';

-- ============================================================================
-- End of FTS Indexes Migration
-- ============================================================================

