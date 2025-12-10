-- Migration: Property Flags System
-- Purpose: Re-implement property flags table for v7 with RLS
-- Date: 2025-03-26
--
-- This migration creates the property_flags table for tracking data quality,
-- risk, compliance, and other issues on properties. Flags can be created by
-- any user who can view the property, but only editors/owners can resolve them.

-- ============================================================================
-- Create Property Flags Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('data_quality', 'risk', 'compliance', 'ownership', 'document', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  description TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_property_flags_property_status
ON public.property_flags(property_id, status, severity)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_property_flags_created_by
ON public.property_flags(created_by_user_id, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_property_flags_severity_status
ON public.property_flags(severity, status, created_at DESC)
WHERE deleted_at IS NULL AND status IN ('open', 'in_review');

-- ============================================================================
-- Updated_at Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS property_flags_set_updated_at ON public.property_flags;
CREATE TRIGGER property_flags_set_updated_at
BEFORE UPDATE ON public.property_flags
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.property_flags ENABLE ROW LEVEL SECURITY;

-- Users can view flags for properties they can access
CREATE POLICY "property_flags_select"
ON public.property_flags FOR SELECT
TO authenticated
USING (
  public.can_view_property(property_id)
  AND deleted_at IS NULL
);

-- Users can create flags for properties they can view
CREATE POLICY "property_flags_insert"
ON public.property_flags FOR INSERT
TO authenticated
WITH CHECK (
  public.can_view_property(property_id)
  AND created_by_user_id = auth.uid()
);

-- Users can update flags if they can edit the property OR they created the flag
CREATE POLICY "property_flags_update"
ON public.property_flags FOR UPDATE
TO authenticated
USING (
  (
    public.can_edit_property(property_id)
    OR created_by_user_id = auth.uid()
  )
  AND deleted_at IS NULL
)
WITH CHECK (
  (
    public.can_edit_property(property_id)
    OR created_by_user_id = auth.uid()
  )
  AND deleted_at IS NULL
);

-- Only editors/owners can resolve flags (set status to resolved/dismissed)
CREATE POLICY "property_flags_resolve"
ON public.property_flags FOR UPDATE
TO authenticated
USING (
  public.can_edit_property(property_id)
  AND deleted_at IS NULL
)
WITH CHECK (
  public.can_edit_property(property_id)
  AND deleted_at IS NULL
  AND (
    -- When resolving, set resolved_at and resolved_by_user_id
    (status IN ('resolved', 'dismissed') AND resolved_at IS NOT NULL AND resolved_by_user_id = auth.uid())
    OR
    -- When reopening, clear resolved fields
    (status = 'open' AND resolved_at IS NULL AND resolved_by_user_id IS NULL)
    OR
    -- When setting to in_review, don't change resolved fields
    (status = 'in_review')
  )
);

-- Admins can delete flags (hard delete)
CREATE POLICY "property_flags_admin_delete"
ON public.property_flags FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.property_flags IS 
'Flags for property data quality, risk, compliance, or other issues. Users who can view a property can create flags, but only editors/owners can resolve them.';

COMMENT ON COLUMN public.property_flags.flag_type IS 
'Type of flag: data_quality (missing/incomplete data), risk (safety/structural concerns), compliance (regulatory issues), ownership (title/legal), document (missing documents), other.';

COMMENT ON COLUMN public.property_flags.severity IS 
'Severity level: low (minor issue), medium (moderate concern), high (significant issue), critical (urgent action required).';

COMMENT ON COLUMN public.property_flags.status IS 
'Flag status: open (new/unresolved), in_review (being investigated), resolved (fixed), dismissed (not an issue).';

-- ============================================================================
-- End of Property Flags Migration
-- ============================================================================

