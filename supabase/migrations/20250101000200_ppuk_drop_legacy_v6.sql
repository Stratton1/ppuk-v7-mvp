-- PPUK v7 - Drop Legacy v6 Tables (safe mode)
-- Purpose: remove obsolete v6 tables that have been superseded by v7 schema.
-- Note: Do NOT touch v7 tables (properties, property_events, documents, media, property_stakeholders, users, profiles, etc.).

-- Drop child tables first to satisfy FK dependencies, then parent extensions.

-- Legacy notes/tasks/flags (per-property auxiliary data from v6)
drop table if exists public.property_notes cascade;
drop table if exists public.property_tasks cascade;
drop table if exists public.property_flags cascade;

-- Legacy audit log
drop table if exists public.audit_logs cascade;

-- Legacy storage metadata
drop table if exists public.property_documents cascade;
drop table if exists public.property_media cascade;

-- Legacy roles and user extension tables
drop table if exists public.user_property_roles cascade;
drop table if exists public.users_extended cascade;

-- Add any additional legacy v6 tables here (keep v7 tables intact).
