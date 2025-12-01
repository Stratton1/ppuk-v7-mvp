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

