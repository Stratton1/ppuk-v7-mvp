# Engineering Audit (PPUK v7)

## 1) Repository Overview
- Single Next.js 16 App Router frontend (`frontend/`) with Supabase backend (Postgres + RLS + Storage) managed via SQL migrations (`supabase/`). No standalone Node backend beyond Supabase RPC/RLS.
- Docs consolidated under `docs/`; build artefacts (`frontend/.next`, `frontend/node_modules`) should not be source-controlled.
- Root manifests/configs exist but the canonical app manifest/configs live under `frontend/`.

## 2) Architecture & Stack
- **Frontend**: Next.js 16, React 19, Tailwind/shadcn UI, server components + server actions, React Query providers, Supabase SSR clients.
- **Backend**: Supabase SQL migrations define schema, enums, RPCs, helpers, and RLS. Storage buckets `property-documents` and `property-photos`.
- **Auth/Roles**: Supabase Auth; users table with `primary_role`; per-property access via `property_stakeholders` with status (owner/buyer/tenant) and permission (editor/viewer); helpers `can_view_property`, `can_edit_property`, etc.
- **Data model**: Properties, stakeholders, documents, media, tasks, invitations, property_events, metadata, integrations, notifications.

## 3) Folder Structure Summary
- **frontend/**: `app/` routes (auth, dashboard, properties, search, public passport, tasks, invitations, settings, API routes), `actions/` (documents/media/roles/visibility/tasks), `components/` (layout, dashboard, property, public), `lib/` (auth, supabase clients, role utils), `hooks/`, `providers/`, `types/`, configs.
- **supabase/**: `migrations/` (core schema, RLS, RPCs, storage, v6 drop, role/permission refactors, backend alignment), `seed.sql`, `config.toml`, CLI metadata.
- **docs/**: Blueprint, roadmap, architecture specs, reports, ops/meta.

## 4) Strengths
- Clear v7 schema with enums, soft-delete fields, helper functions, and RPCs for property workflows.
- Frontend implements major flows (create/edit property, documents/media upload, role management, dashboard, search, public passport) using server actions and Supabase SSR clients.
- RLS policies rebuilt around helper functions; roles/permissions normalized; RPCs updated for v7 tables.
- Types generated from Supabase; Tailwind/shadcn design system and React Query providers in place.

## 5) Issues / Gaps
- **Repo hygiene**: Build artefacts (`frontend/.next`), `node_modules`, and real `.env.local` committed; duplicate root vs frontend package manifests/scripts (root scripts invalid: `next dev frontend`).
- **AuthZ/Access**: Proxy guards only select routes; documents/media access relies on public visibility + broad RLS/storage policies (any authenticated user on public properties); storage bucket policies not property-scoped.
- **Performance**: Dashboard/property pages perform N+1 RPC/signed URL fetches; search lacks FTS/trigram; missing DB indexes on stakeholders/invitations/events deleted_at filters.
- **Ops/CI**: CI workflow outdated; no automated schema drift/type generation checks; minimal tests (single RLS test).
- **Docs drift**: Multiple overlapping audits/blueprints; legacy v6 planning docs still present.

## 6) Outstanding TODOs / Gap Analysis
- Clean repo (remove committed env/build/vendor; fix .gitignore); rationalize manifests to `frontend/package.json`.
- Tighten RLS/storage: property-scoped storage policies; limit document/media read on public properties; align TS `role-utils` with SQL helpers; extend proxy coverage to all authenticated routes/APIs.
- Add DB indexes for `property_stakeholders (user_id, property_id, deleted_at)`, `invitations.property_id`, `property_events(property_id, created_at)`, `documents/media(property_id, deleted_at)`.
- Performance: batch dashboard/property data fetches; parallel signed URLs with bounded concurrency; add pagination/FTS to search.
- CI/tests: add lint/type/build in CI; run `supabase db diff`/`verify_schema`; expand RLS/API/server-action tests.
- Docs: Use this report as canonical; archive deprecated audits; keep architecture/RLS specs aligned to migrations.
