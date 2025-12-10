-- Migration: Watchlist Table
-- Purpose: Create watchlist table for users to save properties
-- Date: 2025-03-27
--
-- This migration creates the watchlist table allowing users to save properties
-- to their personal watchlist with optional notes and change alerts.

-- ============================================================================
-- Create Watchlist Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  notes TEXT,
  alert_on_changes BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_watchlist_user
ON public.watchlist(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_watchlist_property
ON public.watchlist(property_id);

-- ============================================================================
-- Updated_at Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS watchlist_set_updated_at ON public.watchlist;
CREATE TRIGGER watchlist_set_updated_at
BEFORE UPDATE ON public.watchlist
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Users can only view their own watchlist
CREATE POLICY "watchlist_select"
ON public.watchlist FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can only add to their own watchlist
CREATE POLICY "watchlist_insert"
ON public.watchlist FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only update their own watchlist entries
CREATE POLICY "watchlist_update"
ON public.watchlist FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only delete their own watchlist entries
CREATE POLICY "watchlist_delete"
ON public.watchlist FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.watchlist IS 
'User watchlist for saved properties. Users can add properties with optional notes and enable change alerts.';

COMMENT ON COLUMN public.watchlist.alert_on_changes IS 
'If true, user will receive notifications when property changes occur (future feature).';

-- ============================================================================
-- End of Watchlist Migration
-- ============================================================================

