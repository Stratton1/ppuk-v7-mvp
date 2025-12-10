# RLS Verification Report (v7 Roles Alignment)

- Date: 2025-03-15
- Scope: property roles standardized to owner/editor/viewer; helpers/RPCs/RLS rebuilt accordingly.
- Applied migration: `20250315000000_ppuk_v7_roles_permissions.sql`
- RLS helpers: `is_admin`, `role_for_property`, `has_property_role`, `is_property_owner`, `is_property_editor`, `is_property_viewer`, `can_edit_property`, `can_view_property`, `can_upload`, `can_delete`, `can_invite`.
- Policies: recreated for properties, property_stakeholders, documents, media, tasks, property_events, property_metadata, invitations, profiles, notifications, activity_log.
- RPCs: recreated (create/update property, search_properties, get_user_properties, get_recent_activity, get_dashboard_stats, calculate_property_completion, get_public_property, set_public_visibility, grant/revoke_property_role, invite/accept_invitation).
- Seed: updated to owner/editor/viewer roles only.
- Types: regenerated via `supabase gen types typescript --linked`.
- Build: `npm run build` (Next 16) passes; middleware deprecation warning remains (to address with proxy migration).
- Tests: Added `frontend/tests/rls.spec.ts` (expects local Supabase test env; skipped if env vars missing).
