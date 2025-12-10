# Property Passport UK v7.0 — Roadmap & Status

Source of truth: `/docs`, `.cursorrules`, and the Supabase-linked project `jarbgvpyudutzeqtazoo`. Frontend: Next.js 16 App Router, Supabase SSR client, shadcn. Backend: Supabase (Postgres, RLS, Storage), no v6 artifacts.

## Current Status (Mar 2025)
- **Frontend Phase B (done):** Notes subsystem removed from runtime; featured media now pulled directly from `media` (dashboard and public slug pages); no runtime v6 RPCs; build passing on Node 20.
- **Backend Phase 3A (done):** New migration `20250314000000_ppuk_v7_backend_alignment.sql` drops v6 tables/functions, rebuilds helpers/RPCs for v7 tables (properties, property_stakeholders, media, documents, tasks), and aligns public slug/visibility, search, dashboard, recent activity, completion scoring.  
  - Legacy tables removed: `property_media`, `property_documents`, `property_tasks`, `property_notes`, `users_extended`, `user_property_roles`.  
  - Legacy RPCs removed: `get_featured_media`, v6 `get_user_properties`, v6 tasks/notes RPCs, v6 public passport.  
  - Helpers rebuilt: `is_admin` (uses users.primary_role), `has_property_role` (property_stakeholders-aware), slug/visibility helpers.  
  - RPCs rebuilt: create/update property, search_properties, get_user_properties, get_recent_activity, get_dashboard_stats, calculate_property_completion, get_public_property.  
- **Seed (done):** `supabase/seed.sql` rewritten for v7-only data (auth users, users/profiles, properties, property_stakeholders, media, documents, tasks, property_events).  
- **Types (done):** `supabase gen types --linked` regenerated `frontend/types/supabase.ts`; no v6 tables/RPCs remain.  
- **Schema verification:** `verify_schema.sql` updated; `supabase db diff --linked` clean (aside from remote `pg_net` extension noted).  
- **Known warnings:** Next.js middleware deprecation (needs proxy migration); CLI suggests updating `baseline-browser-mapping`.

## Completed Phases & Outcomes
1) **Phase A: Repo audit**  
   - Catalogued all v6 references; confirmed Node 20.19.6, Supabase link to `jarbgvpyudutzeqtazoo`.  
2) **Phase B: Frontend v7 alignment (runtime)**  
   - Removed notes UI/actions from runtime; featured media via `media`; no v6 RPC usage; build green.  
3) **Phase 3A: Backend alignment (current)**  
   - Dropped v6 schema/RPCs; rebuilt helpers/RPCs/seed; regenerated types; updated verification script.

## Remaining Work to Finished Product
- **Middleware migration:** Replace deprecated `middleware` with Next.js 16 `proxy` convention and verify routes.  
- **RLS regression tests:** Add/test RLS for all v7 tables (properties, property_stakeholders, media, documents, tasks, property_events, property_metadata, invitations, integrations).  
- **RPC QA:** Ensure frontend uses only the rebuilt v7 RPCs; remove any lingering codepaths to legacy names after types refresh is integrated into app.  
- **Docs cleanup:** Update any docs still describing React Router v6, v6 tables, or legacy flows; align architecture specs to current schema and RPCs.  
- **Seed enrichment:** Add richer sample data (flags, notifications, invitations, metadata) if needed for demos.  
- **Performance/security:** Address Next.js middleware warning, review storage policies, consider adding `pg_net` handling note.  
- **Launch readiness:** Run verify_schema on remote, add CI gates for migrations/types, and document operational runbooks (backups, DR, monitoring).

## Forward Plan (near-term)
- Regenerate frontend types in CI after each migration; block merges on drift.  
- Add automated RLS tests (policy coverage per role) and RPC integration tests.  
- Finalize middleware/proxy migration and re-run `npm run build`.  
- Review and update docs for v7 terminology and flows; retire v6 references.  
- Confirm remote schema matches (rerun `supabase db diff --linked` when pool allows) and rerun `verify_schema.sql` on remote.

## Quick Reference
- Latest migration: `20250314000000_ppuk_v7_backend_alignment.sql`  
- Seed file: `supabase/seed.sql` (v7-only)  
- Types: `frontend/types/supabase.ts` (regenerated)  
- Verification: `verify_schema.sql`  
- Linked project: `jarbgvpyudutzeqtazoo`
