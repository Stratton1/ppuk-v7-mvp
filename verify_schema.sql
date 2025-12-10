-- PPUK v7 Schema Verification Script
-- Run this via: supabase db remote --linked, then \i verify_schema.sql

-- 1. Check legacy tables are removed
SELECT 'LEGACY TABLES CHECK:' as check_type;
SELECT tablename as legacy_table_found
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'property_notes', 'property_tasks', 'property_flags', 
    'audit_logs', 'property_documents', 'property_media', 
    'user_property_roles', 'users_extended'
  )
ORDER BY tablename;

-- 2. Check v7 tables are present
SELECT 'V7 TABLES CHECK:' as check_type;
SELECT tablename as v7_table
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'profiles', 'roles', 'user_roles', 'properties', 
    'property_stakeholders', 'documents', 'document_versions', 
    'media', 'notifications', 'activity_log', 'property_events', 
    'property_metadata', 'integrations', 'invitations', 'tasks'
  )
ORDER BY tablename;

-- 3. Check RLS is enabled
SELECT 'RLS CHECK:' as check_type;
SELECT relname as table_name, relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname IN (
    'users','profiles','roles','user_roles','properties',
    'property_stakeholders','documents','document_versions',
    'media','notifications','activity_log','property_events',
    'property_metadata','integrations','invitations','tasks'
  )
  AND relkind = 'r'
ORDER BY relname;

-- 4. Check helper functions exist and reference correct tables
SELECT 'HELPER FUNCTIONS CHECK:' as check_type;
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  CASE 
    WHEN pg_get_functiondef(oid) LIKE '%property_stakeholders%' THEN 'OK - uses property_stakeholders'
    WHEN pg_get_functiondef(oid) LIKE '%user_property_roles%' THEN 'ERROR - still uses user_property_roles'
    ELSE 'CHECK MANUALLY'
  END as status
FROM pg_proc 
WHERE proname IN ('is_service_role', 'is_property_stakeholder', 'is_property_owner')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- 5. Check policies are present
SELECT 'POLICIES CHECK:' as check_type;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles', 'user_roles', 'properties', 'property_stakeholders',
    'documents', 'document_versions', 'media', 'notifications',
    'activity_log', 'property_events', 'property_metadata',
    'integrations', 'invitations', 'tasks'
  )
GROUP BY tablename
ORDER BY tablename;

-- 6. Ensure no functions reference legacy v6 tables
SELECT 'LEGACY FUNCTION REFERENCES:' as check_type;
SELECT proname as legacy_function
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND pg_get_functiondef(oid) ~ '(property_media|property_documents|property_tasks|property_notes|users_extended|user_property_roles)'
ORDER BY proname;

-- 7. Verify v7 RPCs are present
SELECT 'EXPECTED RPCS:' as check_type;
SELECT proname as function_name
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN (
    'create_property_with_role',
    'update_property_with_event',
    'search_properties',
    'get_user_properties',
    'get_recent_activity',
    'get_dashboard_stats',
    'calculate_property_completion',
    'get_public_property',
    'set_public_visibility',
    'regenerate_slug',
    'has_property_role',
    'is_admin'
  )
ORDER BY proname;
