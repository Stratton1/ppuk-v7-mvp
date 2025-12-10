-- Reset RPCs to clear pg_proc metadata before recreating canonical versions
-- Step 1: Drop RLS policies that depend on helper functions/RPCs

-- Properties
drop policy if exists "properties_agent_update" on public.properties;
drop policy if exists "properties_owner_update" on public.properties;

-- Documents
drop policy if exists "documents_agent_insert" on public.property_documents;
drop policy if exists "documents_surveyor_insert" on public.property_documents;
drop policy if exists "documents_conveyancer_insert" on public.property_documents;
drop policy if exists "documents_user_select" on public.property_documents;

-- Media
drop policy if exists "media_agent_insert" on public.property_media;
drop policy if exists "media_user_select" on public.property_media;

-- Tasks
drop policy if exists "select_property_tasks" on public.property_tasks;
drop policy if exists "insert_property_tasks" on public.property_tasks;
drop policy if exists "update_property_tasks" on public.property_tasks;
drop policy if exists "delete_property_tasks" on public.property_tasks;

-- Notes
drop policy if exists "select_property_notes" on public.property_notes;
drop policy if exists "insert_property_notes" on public.property_notes;
drop policy if exists "update_property_notes" on public.property_notes;
drop policy if exists "delete_property_notes" on public.property_notes;

-- Events
drop policy if exists "select_property_events" on public.property_events;


-- Step 2: Drop RPCs
-- Use CASCADE to automatically drop dependent policies
drop function if exists public.has_property_role(uuid, text[]) cascade;
drop function if exists public.get_featured_media(uuid);
drop function if exists public.create_property_with_event(text, text, numeric, numeric);
drop function if exists public.update_property_with_event(uuid, text, text, numeric, numeric, text);
drop function if exists public.search_properties(text);
drop function if exists public.can_access_document(uuid, uuid, text);
drop function if exists public.get_property_tasks(uuid);
drop function if exists public.get_property_notes(uuid);
drop function if exists public.calculate_property_completion(uuid);
drop function if exists public.get_user_properties();
drop function if exists public.get_recent_activity(uuid);
drop function if exists public.get_dashboard_stats(uuid);
drop function if exists public.get_public_property(text);
drop function if exists public.set_public_visibility(uuid, boolean);
drop function if exists public.regenerate_slug(uuid);
