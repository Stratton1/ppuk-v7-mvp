-- Property Passport UK v7.0 - RLS Helper Functions
-- Migration: 20241127000000_rls_helper_functions.sql
-- Purpose: Create reusable helper functions for Row Level Security policies
-- Source: /docs/RLS_POLICY_PLAN.md Section 5
-- Status: Helper functions only - RLS policies NOT created yet
-- Important: These functions must be created BEFORE enabling RLS and creating policies

-- ============================================================================
-- HELPER FUNCTION 1: is_admin()
-- ============================================================================
-- Purpose: Check if current user is a system administrator
-- Returns: BOOLEAN
-- Usage: Used in all tables to grant admin override access
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users_extended
    WHERE user_id = auth.uid()
      AND primary_role = 'admin'
      AND deleted_at IS NULL
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS 
'Returns true if the current authenticated user has admin role in users_extended table. Used for admin override in RLS policies.';


-- ============================================================================
-- HELPER FUNCTION 2: has_property_role(property_id, allowed_roles[])
-- ============================================================================
-- Purpose: Check if current user has any of the specified roles for a property
-- Parameters:
--   - property_id: UUID of the property
--   - allowed_roles: Array of role strings (e.g., ARRAY['owner', 'agent'])
-- Returns: BOOLEAN
-- Usage: Most common permission check across all property-related tables
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_property_role(
  property_id UUID,
  allowed_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_property_roles
    WHERE user_id = auth.uid()
      AND user_property_roles.property_id = has_property_role.property_id
      AND role = ANY(allowed_roles)
      AND deleted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

COMMENT ON FUNCTION public.has_property_role(UUID, TEXT[]) IS 
'Returns true if the current user has any of the specified roles for the given property, with active (non-expired, non-deleted) status.';


-- ============================================================================
-- HELPER FUNCTION 3: is_property_owner(property_id)
-- ============================================================================
-- Purpose: Specific check for property ownership
-- Parameters:
--   - property_id: UUID of the property
-- Returns: BOOLEAN
-- Usage: Operations requiring ownership (delete, grant roles, full edit)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_property_owner(property_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_property_roles
    WHERE user_id = auth.uid()
      AND user_property_roles.property_id = is_property_owner.property_id
      AND role = 'owner'
      AND deleted_at IS NULL
  );
END;
$$;

COMMENT ON FUNCTION public.is_property_owner(UUID) IS 
'Returns true if the current user has the owner role for the specified property.';


-- ============================================================================
-- HELPER FUNCTION 4: is_property_creator(property_id)
-- ============================================================================
-- Purpose: Check if current user created the property
-- Parameters:
--   - property_id: UUID of the property
-- Returns: BOOLEAN
-- Usage: Fallback permission when no explicit role exists yet
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_property_creator(property_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.properties
    WHERE id = is_property_creator.property_id
      AND created_by_user_id = auth.uid()
  );
END;
$$;

COMMENT ON FUNCTION public.is_property_creator(UUID) IS 
'Returns true if the current user is the creator (created_by_user_id) of the specified property.';


-- ============================================================================
-- HELPER FUNCTION 5: can_access_document(document_id)
-- ============================================================================
-- Purpose: Complex document access check considering document type and user role
-- Parameters:
--   - document_id: UUID of the document
-- Returns: BOOLEAN
-- Usage: All document SELECT policies
-- Logic: Role-based access matrix for 12 document types across 8 roles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_access_document(document_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  doc_property_id UUID;
  doc_type TEXT;
  doc_status TEXT;
BEGIN
  -- Get document details
  SELECT property_id, document_type, status
  INTO doc_property_id, doc_type, doc_status
  FROM public.property_documents
  WHERE id = can_access_document.document_id;
  
  -- If document not found, deny access
  IF doc_property_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if archived - only owners and admins can see archived documents
  IF doc_status = 'archived' THEN
    RETURN public.is_admin() OR public.is_property_owner(doc_property_id);
  END IF;
  
  -- Admins can access all documents
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Owners can access all documents for their properties
  IF public.is_property_owner(doc_property_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Conveyancers: title, survey, search, identity, contract, compliance
  IF public.has_property_role(doc_property_id, ARRAY['conveyancer']) THEN
    RETURN doc_type IN ('title', 'survey', 'search', 'identity', 'contract', 'compliance');
  END IF;
  
  -- Surveyors: survey, planning, compliance, warranty
  IF public.has_property_role(doc_property_id, ARRAY['surveyor']) THEN
    RETURN doc_type IN ('survey', 'planning', 'compliance', 'warranty');
  END IF;
  
  -- Agents: survey, planning, warranty (marketing-relevant)
  IF public.has_property_role(doc_property_id, ARRAY['agent']) THEN
    RETURN doc_type IN ('survey', 'planning', 'warranty');
  END IF;
  
  -- Buyers: survey, planning, warranty (shared by owner)
  IF public.has_property_role(doc_property_id, ARRAY['buyer']) THEN
    RETURN doc_type IN ('survey', 'planning', 'warranty');
  END IF;
  
  -- Tenants: compliance documents (gas safety, electrical safety, EPC)
  IF public.has_property_role(doc_property_id, ARRAY['tenant']) THEN
    RETURN doc_type IN ('compliance', 'warranty');
  END IF;
  
  -- Viewers: no document access unless explicitly granted (future enhancement)
  -- For now, viewers have no document access
  
  -- Default: deny access
  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION public.can_access_document(UUID) IS 
'Returns true if the current user can access the specified document based on their role and the document type. Implements the document access matrix from RLS_POLICY_PLAN.md.';


-- ============================================================================
-- HELPER FUNCTION 6: is_approved_for_property(property_id)
-- ============================================================================
-- Purpose: Check if user has active, non-expired access
-- Parameters:
--   - property_id: UUID of the property
-- Returns: BOOLEAN
-- Usage: Validate approved professional access
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_approved_for_property(property_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_property_roles
    WHERE user_id = auth.uid()
      AND user_property_roles.property_id = is_approved_for_property.property_id
      AND deleted_at IS NULL
      AND granted_by_user_id IS NOT NULL  -- Must have been granted by someone
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

COMMENT ON FUNCTION public.is_approved_for_property(UUID) IS 
'Returns true if the current user has been explicitly granted access to the property by another user and the access has not expired or been revoked.';


-- ============================================================================
-- HELPER FUNCTION 7: is_within_access_window(property_id)
-- ============================================================================
-- Purpose: Check if current time is within granted access period
-- Parameters:
--   - property_id: UUID of the property
-- Returns: BOOLEAN
-- Usage: Time-sensitive access checks for temporary professional access
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_within_access_window(property_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_property_roles
    WHERE user_id = auth.uid()
      AND user_property_roles.property_id = is_within_access_window.property_id
      AND deleted_at IS NULL
      AND granted_at <= NOW()
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

COMMENT ON FUNCTION public.is_within_access_window(UUID) IS 
'Returns true if the current user has active access to the property within the granted time window (between granted_at and expires_at).';


-- ============================================================================
-- HELPER FUNCTION 8: get_user_property_roles(property_id)
-- ============================================================================
-- Purpose: Get all active roles current user has for a property
-- Parameters:
--   - property_id: UUID of the property
-- Returns: TEXT[] (array of role strings)
-- Usage: Display user's current access level in UI
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_property_roles(property_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN ARRAY(
    SELECT role 
    FROM public.user_property_roles
    WHERE user_id = auth.uid()
      AND user_property_roles.property_id = get_user_property_roles.property_id
      AND deleted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY 
      CASE role
        WHEN 'admin' THEN 1
        WHEN 'owner' THEN 2
        WHEN 'agent' THEN 3
        WHEN 'conveyancer' THEN 4
        WHEN 'surveyor' THEN 5
        WHEN 'buyer' THEN 6
        WHEN 'tenant' THEN 7
        WHEN 'viewer' THEN 8
        ELSE 9
      END
  );
END;
$$;

COMMENT ON FUNCTION public.get_user_property_roles(UUID) IS 
'Returns an array of all active roles the current user has for the specified property, ordered by privilege level (highest first).';


-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================
-- All helper functions should be executable by authenticated users
-- SECURITY DEFINER ensures they run with the privileges of the function owner
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_property_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_creator(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_document(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved_for_property(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_within_access_window(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_property_roles(UUID) TO authenticated;


-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- This migration creates 8 helper functions that will be used by RLS policies.
-- 
-- NEXT STEPS:
-- 1. Apply this migration to staging/local database
-- 2. Test each function individually with test users
-- 3. Verify performance (these are called frequently in RLS checks)
-- 4. Create indexes if needed (user_property_roles should have indexes on user_id, property_id, role)
-- 5. After testing, create the actual RLS policies migration
-- 6. Enable RLS on each table
--
-- ROLLBACK:
-- To rollback this migration:
-- DROP FUNCTION IF EXISTS public.get_user_property_roles(UUID);
-- DROP FUNCTION IF EXISTS public.is_within_access_window(UUID);
-- DROP FUNCTION IF EXISTS public.is_approved_for_property(UUID);
-- DROP FUNCTION IF EXISTS public.can_access_document(UUID);
-- DROP FUNCTION IF EXISTS public.is_property_creator(UUID);
-- DROP FUNCTION IF EXISTS public.is_property_owner(UUID);
-- DROP FUNCTION IF EXISTS public.has_property_role(UUID, TEXT[]);
-- DROP FUNCTION IF EXISTS public.is_admin();
-- ============================================================================

