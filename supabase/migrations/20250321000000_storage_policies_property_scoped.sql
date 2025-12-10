-- Migration: Property-Scoped Storage Policies
-- Purpose: Replace overly permissive storage policies with property-scoped access control
-- Date: 2025-03-21
--
-- This migration updates storage bucket policies to enforce property-level access:
-- - Documents: Only accessible to users who can view the property (via can_view_property helper)
-- - Photos: Public read only for public_visibility=true properties; authenticated read requires property access
--
-- Security: This is a critical security update - test thoroughly before deploying

-- ============================================================================
-- Drop Existing Overly Permissive Policies
-- ============================================================================

DROP POLICY IF EXISTS "authenticated_read_documents" ON storage.objects;
DROP POLICY IF EXISTS "public_read_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_read_photos" ON storage.objects;

-- ============================================================================
-- Property-Scoped Document Read Policy
-- ============================================================================
-- Documents are only accessible to authenticated users who can view the property
-- This uses the can_view_property helper function which checks:
-- - Property ownership
-- - Stakeholder roles (status + permission)
-- - Public visibility (for public properties)
-- - Admin/service role bypass

CREATE POLICY "property_scoped_read_documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-documents'
  AND EXISTS (
    SELECT 1
    FROM public.documents d
    WHERE d.storage_path = (storage.objects.name)
      AND d.deleted_at IS NULL
      AND public.can_view_property(d.property_id)
  )
);

-- ============================================================================
-- Property-Scoped Photo Read Policies
-- ============================================================================

-- Public read: Only for public_visibility=true properties
-- Anonymous users can view photos for public properties only
CREATE POLICY "property_scoped_read_photos_public"
ON storage.objects FOR SELECT TO anon
USING (
  bucket_id = 'property-photos'
  AND EXISTS (
    SELECT 1
    FROM public.media m
    JOIN public.properties p ON p.id = m.property_id
    WHERE m.storage_path = (storage.objects.name)
      AND m.deleted_at IS NULL
      AND p.public_visibility = true
      AND p.deleted_at IS NULL
      AND p.status = 'active'
  )
);

-- Authenticated read: For users who can view the property
-- This covers private properties where user has access via stakeholder role
CREATE POLICY "property_scoped_read_photos_authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-photos'
  AND EXISTS (
    SELECT 1
    FROM public.media m
    WHERE m.storage_path = (storage.objects.name)
      AND m.deleted_at IS NULL
      AND public.can_view_property(m.property_id)
  )
);

-- ============================================================================
-- Upload Policies (Keep existing, but add property access check)
-- ============================================================================
-- Note: Upload policies should also check property access, but for now we keep
-- the existing upload policies and rely on application-level checks.
-- Future enhancement: Add property-scoped upload policies

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "property_scoped_read_documents" ON storage.objects IS 
'Property-scoped document read: Only authenticated users who can view the property can access documents. Uses can_view_property helper function.';

COMMENT ON POLICY "property_scoped_read_photos_public" ON storage.objects IS 
'Public photo read: Anonymous users can view photos only for public_visibility=true active properties.';

COMMENT ON POLICY "property_scoped_read_photos_authenticated" ON storage.objects IS 
'Authenticated photo read: Authenticated users can view photos for properties they can access via can_view_property helper function.';

-- ============================================================================
-- End of Storage Policies Migration
-- ============================================================================

