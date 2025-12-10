-- Migration: Admin Dashboard RPCs
-- Purpose: Create RPC functions for admin dashboard, user management, analytics, and audit logs
-- Date: 2025-03-28

-- ============================================================================
-- RPC Function: get_admin_dashboard_stats
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_properties', (SELECT COUNT(*) FROM public.properties WHERE deleted_at IS NULL),
    'active_properties', (SELECT COUNT(*) FROM public.properties WHERE status = 'active' AND deleted_at IS NULL),
    'draft_properties', (SELECT COUNT(*) FROM public.properties WHERE status = 'draft' AND deleted_at IS NULL),
    'archived_properties', (SELECT COUNT(*) FROM public.properties WHERE status = 'archived' AND deleted_at IS NULL),
    'total_users', (SELECT COUNT(*) FROM public.users),
    'total_documents', (SELECT COUNT(*) FROM public.documents WHERE deleted_at IS NULL),
    'total_media', (SELECT COUNT(*) FROM public.media WHERE deleted_at IS NULL),
    'api_cache_entries', (SELECT COUNT(*) FROM public.api_cache WHERE expires_at > NOW()),
    'open_flags', (SELECT COUNT(*) FROM public.property_flags WHERE status = 'open' AND deleted_at IS NULL),
    'resolved_flags', (SELECT COUNT(*) FROM public.property_flags WHERE status = 'resolved' AND deleted_at IS NULL),
    'total_tasks', (SELECT COUNT(*) FROM public.tasks WHERE status NOT IN ('resolved', 'cancelled') AND deleted_at IS NULL)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

COMMENT ON FUNCTION public.get_admin_dashboard_stats() IS 'Returns system-wide statistics for admin dashboard. Only accessible to admins via RLS.';

-- ============================================================================
-- RPC Function: get_admin_users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_admin_users(
  limit_count INT DEFAULT 50,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  primary_role TEXT,
  created_at TIMESTAMPTZ,
  properties_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.primary_role::TEXT,
    u.created_at,
    COUNT(DISTINCT ps.property_id) as properties_count
  FROM public.users u
  LEFT JOIN public.property_stakeholders ps ON ps.user_id = u.id AND ps.deleted_at IS NULL
  GROUP BY u.id, u.email, u.full_name, u.primary_role, u.created_at
  ORDER BY u.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_users(INT, INT) TO authenticated;

COMMENT ON FUNCTION public.get_admin_users(INT, INT) IS 'Returns paginated list of users with property counts. Only accessible to admins.';

-- ============================================================================
-- RPC Function: get_properties_over_time
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_properties_over_time(
  days_back INT DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count
  FROM public.properties
  WHERE deleted_at IS NULL
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_properties_over_time(INT) TO authenticated;

COMMENT ON FUNCTION public.get_properties_over_time(INT) IS 'Returns property creation counts grouped by date for analytics.';

-- ============================================================================
-- RPC Function: get_user_growth
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_growth(
  days_back INT DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count
  FROM public.users
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_growth(INT) TO authenticated;

COMMENT ON FUNCTION public.get_user_growth(INT) IS 'Returns user registration counts grouped by date for analytics.';

-- ============================================================================
-- RPC Function: get_document_uploads_over_time
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_document_uploads_over_time(
  days_back INT DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count
  FROM public.documents
  WHERE deleted_at IS NULL
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_document_uploads_over_time(INT) TO authenticated;

COMMENT ON FUNCTION public.get_document_uploads_over_time(INT) IS 'Returns document upload counts grouped by date for analytics.';

-- ============================================================================
-- RPC Function: get_api_usage_by_provider
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_api_usage_by_provider()
RETURNS TABLE (
  provider TEXT,
  count BIGINT,
  last_fetched TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    source::TEXT as provider,
    COUNT(*) as count,
    MAX(fetched_at) as last_fetched
  FROM public.api_cache
  WHERE expires_at > NOW()
  GROUP BY source
  ORDER BY count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_api_usage_by_provider() TO authenticated;

COMMENT ON FUNCTION public.get_api_usage_by_provider() IS 'Returns API cache usage statistics by provider.';

-- ============================================================================
-- RPC Function: get_audit_logs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_audit_logs(
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0,
  p_user_id UUID DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  actor_user_id UUID,
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  created_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    al.id,
    al.actor_user_id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.created_at,
    al.metadata
  FROM public.activity_log al
  WHERE
    (p_user_id IS NULL OR al.actor_user_id = p_user_id)
    AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
    AND (p_action IS NULL OR al.action = p_action)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.get_audit_logs(INT, INT, UUID, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_audit_logs(INT, INT, UUID, TEXT, TEXT) IS 'Returns filtered audit log entries. Only accessible to admins.';

-- ============================================================================
-- End of Admin RPCs Migration
-- ============================================================================

