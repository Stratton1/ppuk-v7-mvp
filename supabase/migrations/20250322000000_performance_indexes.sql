-- Migration: Performance Indexes
-- Purpose: Add critical database indexes to optimize query performance
-- Date: 2025-03-22
--
-- This migration adds indexes on frequently queried columns to eliminate
-- sequential scans and improve query performance, especially for:
-- - Property stakeholder lookups (user_id + property_id)
-- - Activity timeline queries (property_id + created_at)
-- - Document/media queries (property_id + deleted_at)
-- - Invitation lookups (property_id + email)
-- - Task queries (property_id + status + due_date)
--
-- All indexes use partial indexes (WHERE deleted_at IS NULL) where applicable
-- to reduce index size and improve performance for active records only.

-- ============================================================================
-- Property Stakeholders Indexes
-- ============================================================================
-- Most common query: Find all properties for a user (user_id + deleted_at)
-- Also: Find all stakeholders for a property (property_id + deleted_at)

CREATE INDEX IF NOT EXISTS idx_property_stakeholders_user_property_active
ON public.property_stakeholders(user_id, property_id, deleted_at)
WHERE deleted_at IS NULL;

-- For property-level queries (find all stakeholders for a property)
CREATE INDEX IF NOT EXISTS idx_property_stakeholders_property_active
ON public.property_stakeholders(property_id, deleted_at, expires_at)
WHERE deleted_at IS NULL;

-- For role-based queries (find users with specific status/permission)
CREATE INDEX IF NOT EXISTS idx_property_stakeholders_property_status_permission
ON public.property_stakeholders(property_id, status, permission, deleted_at)
WHERE deleted_at IS NULL;

-- ============================================================================
-- Property Events Indexes
-- ============================================================================
-- Timeline queries: property_id + created_at DESC (most recent first)

CREATE INDEX IF NOT EXISTS idx_property_events_property_created_desc
ON public.property_events(property_id, created_at DESC);

-- For event type filtering
CREATE INDEX IF NOT EXISTS idx_property_events_property_type_created
ON public.property_events(property_id, event_type, created_at DESC);

-- ============================================================================
-- Documents Indexes
-- ============================================================================
-- Property queries: property_id + deleted_at + document_type

CREATE INDEX IF NOT EXISTS idx_documents_property_active
ON public.documents(property_id, deleted_at, document_type)
WHERE deleted_at IS NULL;

-- For document type filtering
CREATE INDEX IF NOT EXISTS idx_documents_property_type_active
ON public.documents(property_id, document_type, deleted_at)
WHERE deleted_at IS NULL AND document_type IS NOT NULL;

-- For uploader queries (find documents uploaded by user)
CREATE INDEX IF NOT EXISTS idx_documents_uploader_active
ON public.documents(uploaded_by_user_id, property_id, deleted_at)
WHERE deleted_at IS NULL;

-- ============================================================================
-- Media Indexes
-- ============================================================================
-- Property queries: property_id + deleted_at + media_type

-- Add missing column for v7 schema
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_media_property_active_type
ON public.media(property_id, deleted_at, media_type, created_at)
WHERE deleted_at IS NULL;

-- Featured media queries (common for property cards/dashboards)
CREATE INDEX IF NOT EXISTS idx_media_featured
ON public.media(property_id, is_featured, status, deleted_at)
WHERE is_featured = true AND status = 'active' AND deleted_at IS NULL;

-- For uploader queries
CREATE INDEX IF NOT EXISTS idx_media_uploader_active
ON public.media(uploaded_by_user_id, property_id, deleted_at)
WHERE deleted_at IS NULL;

-- ============================================================================
-- Invitations Indexes
-- ============================================================================
-- Property queries: property_id + email + status

CREATE INDEX IF NOT EXISTS idx_invitations_property_email
ON public.invitations(property_id, email, status);

-- For status filtering (pending, accepted, declined)
CREATE INDEX IF NOT EXISTS idx_invitations_status_created
ON public.invitations(status, created_at DESC)
WHERE status = 'pending';

-- ============================================================================
-- Tasks Indexes
-- ============================================================================
-- Property queries: property_id + status + due_date

CREATE INDEX IF NOT EXISTS idx_tasks_property_status_due
ON public.tasks(property_id, status, due_date)
WHERE status NOT IN ('resolved', 'cancelled');

-- For assigned user queries
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_status
ON public.tasks(assigned_to_user_id, status, due_date)
WHERE assigned_to_user_id IS NOT NULL AND status NOT IN ('resolved', 'cancelled');

-- For priority queries
CREATE INDEX IF NOT EXISTS idx_tasks_property_priority_due
ON public.tasks(property_id, priority, due_date, status)
WHERE status NOT IN ('resolved', 'cancelled');

-- ============================================================================
-- Properties Indexes (if not already present)
-- ============================================================================
-- For public visibility queries (public passport pages)
CREATE INDEX IF NOT EXISTS idx_properties_public_visibility
ON public.properties(public_visibility, status, deleted_at)
WHERE public_visibility = true AND deleted_at IS NULL AND status = 'active';

-- For UPRN lookups (common for external API integrations)
CREATE INDEX IF NOT EXISTS idx_properties_uprn_active
ON public.properties(uprn, deleted_at)
WHERE uprn IS NOT NULL AND deleted_at IS NULL;

-- For created_by queries (user's properties)
CREATE INDEX IF NOT EXISTS idx_properties_created_by_active
ON public.properties(created_by_user_id, deleted_at, created_at DESC)
WHERE deleted_at IS NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON INDEX idx_property_stakeholders_user_property_active IS 
'Optimizes user property access queries (dashboard, property lists)';

COMMENT ON INDEX idx_property_events_property_created_desc IS 
'Optimizes activity timeline queries (most recent events first)';

COMMENT ON INDEX idx_documents_property_active IS 
'Optimizes document listing queries by property';

COMMENT ON INDEX idx_media_featured IS 
'Optimizes featured media queries for property cards and dashboards';

COMMENT ON INDEX idx_invitations_property_email IS 
'Optimizes invitation lookups by property and email';

COMMENT ON INDEX idx_tasks_property_status_due IS 
'Optimizes task queries by property, status, and due date';

-- ============================================================================
-- End of Performance Indexes Migration
-- ============================================================================

