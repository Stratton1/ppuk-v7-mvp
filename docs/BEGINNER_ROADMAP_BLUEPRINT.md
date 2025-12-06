# Property Passport UK — Beginner Roadmap Blueprint

This file explains **what the Property Passport UK (PPUK) platform is, what has been built, and what is still left to do**.  
It is written for someone new to the repo who wants the big picture before diving into code.

---

## 1. Quick Orientation

- **Mission:** create a permanent digital passport for every UK property so all documents, data feeds, and collaborators stay in sync.
- **Stack:** Next.js 16 App Router (frontend), Supabase Postgres + Storage (backend), Tailwind + shadcn/ui (design system).
- **Key folders:**
  - `frontend/` → Next.js app (`app/`, `components/`, `actions/`, `lib/`, `hooks/`, `providers/`, `types/`).
  - `supabase/` → SQL migrations, seed data, config, edge functions scaffold.
  - `docs/` → source of truth for architecture, schema, RLS, workflows.
- **Authoritative docs to keep handy:**  
  - `docs/PPUK_V7_COMPLETE_BLUEPRINT_V2.md` (canonical blueprint)  
  - `docs/REPO_STRUCTURE.md` (layout map)  
  - `docs/architecture/AUTH_ROLE_ARCHITECTURE_SPECIFICATION.md`  
  - `docs/architecture/SCHEMA_ARCHITECTURE_SPECIFICATION.md`  
  - `docs/architecture/RLS_ARCHITECTURE_V7.md`  
  - `docs/roadmap.md`, `docs/ops/current_state_and_next_steps.txt`

---

## 2. Progress Tracker (✅ = done, ⏳ = in progress, ⬜️ = still to do)

### Foundation & Tooling
- ✅ Repo initialised with Node 20+, TypeScript strict, ESLint/Prettier, Husky.
- ✅ CI runs lint → typecheck → test → build for both backend and frontend.
- ⬜️ Replace committed `.env` remnants with clean `.env.example` + secrets documentation.
- ⬜️ Align duplicate `package.json`/`lockfile` situation (root vs `frontend/`) for Vercel + CI clarity.

### Supabase Schema & Security
- ✅ v7 schema + RLS migrations applied; legacy v6 tables dropped (`20250314000000_ppuk_v7_backend_alignment.sql`).
- ✅ Helper functions (`is_property_stakeholder`, `is_property_owner`, etc.) and core RPCs rebuilt for v7 tables.
- ✅ Supabase Storage buckets (`property-documents`, `property-photos`) configured with private access + signed URLs.
- ⏳ Apply migrations + RLS verification against the linked remote project (run `verify_schema.sql` remotely).
- ⬜️ Add automated RLS regression tests that cover every role/table combination.
- ⬜️ Decide long-term plan for `property_flags`/`property_notes` (either re-introduce in v7 schema or retire).

### Frontend (Next.js 16)
- ✅ Layout shell (navbar/sidebar/footer), landing page, providers, Supabase SSR client wiring.
- ✅ Server actions exist for documents, media, public visibility, tasks/notes stubs.
- ⏳ Runtime alignment to the new v7 RPCs/tables (some components/actions still reference old names—see `docs/LEGACY_SCHEMA_REMOVAL_PLAN.md` for the mapping).
- ⬜️ Complete auth UX (register/login/logout, protected routes, role-aware dashboards).
- ⬜️ Flesh out dashboard widgets (stats cards, recent activity, tasks/notes) and property tabs for every data slice.
- ⬜️ Add React Query hooks around server actions for shared data flows (`useProperties`, `useDashboard`, etc.).

### Authentication & Roles
- ✅ Supabase Auth chosen as the single identity provider; role matrix defined (`docs/AUTH_ROLE_ARCHITECTURE_SPECIFICATION.md`).
- ⏳ Implement `getServerUser`, role helpers, middleware guards, and client hooks exactly as specified (files exist but need end-to-end validation).
- ⬜️ Build invitation & role management UI powered by the new `property_stakeholders` table.

### Documents, Media, Tasks
- ✅ Server actions for upload/delete (documents & media) scaffolded with validation + signed URLs.
- ✅ Tasks/notes UI placeholders remain so the views compile.
- ⏳ Update every action/component to the new `documents`, `media`, `tasks` tables + regenerated Supabase types.
- ⬜️ Restore notes/flags only after agreeing on their v7 schema story (currently stubs).

### External Integrations & Edge Functions
- ✅ Blueprint lists 30+ free UK government APIs and edge-function patterns.
- ⬜️ Build Supabase Edge Functions per provider (EPC, Flood, HMLR, Police, Planning, etc.) with Zod validation + caching.
- ⬜️ Add API cache table/tests and expose React Query hooks + UI cards (EPCDisplay, FloodRiskDisplay, etc.).

### Operations, Security, Compliance
- ✅ Baseline security posture captured in `docs/security.md` & `.cursorrules` (RLS-first, no client secrets, document signing).
- ✅ Health check and error-handling middleware exist on the Express scaffold (backend ready if ever needed).
- ⏳ Replace deprecated middleware pattern with Next.js 16 `proxy` (warning currently shown in `npm run dev`).
- ⏳ Document runbooks (`docs/roadmap.md` lists: schema verification, secrets hygiene, backups, monitoring).
- ⬜️ Add structured logging, monitoring hooks, and storage anti-virus scans per `docs/current_state_and_next_steps.txt`.

### Testing & QA
- ✅ Vitest sample exists for `/health`; placeholder Playwright setup planned.
- ⬜️ Expand unit/integration suites for business logic + RLS coverage.
- ⬜️ Add E2E flow: auth → create property → upload doc/photo → assign role → toggle public slug → view public page.
- ⬜️ Run accessibility + performance audits (Lighthouse/Next profiler).

---

## 3. Simplified Build Path for New Contributors

1. **Read the docs** listed above (especially the v7 blueprint + auth/role spec).  
2. **Run Supabase locally**: `supabase start`, then `supabase db reset` to apply migrations and seed data.  
3. **Regenerate types** whenever the DB changes:  
   ```bash
   supabase gen types typescript --linked > frontend/types/supabase.ts
   ```  
4. **Start the app** (from `frontend/`): `npm install`, `npm run dev`. Resolve the Turbopack lock warning by ensuring only one dev server runs and by deleting stale `.next/dev/lock` files.
5. **Tackle work in slices**:
   - Alignment tasks (rename legacy table usage → v7 equivalents).
   - Feature builds (auth flows, dashboards, edge functions).
   - Ops/testing (RLS tests, monitoring, docs).

---

## 4. Where Things Stand (Narrative Overview)

### Already solid
- Database design, migrations, and helper functions reflect the finalised v7 architecture.  
- Core UI shell, Supabase providers, and server actions give us an end-to-end path for key flows (documents, media, property visibility).  
- Documentation is extensive: every architectural choice, RLS rule, and integration intent is captured under `docs/`.

### Needs immediate attention
- Frontend still references old tables/RPCs in several places—follow the mapping in `docs/LEGACY_SCHEMA_REMOVAL_PLAN.md` to finish the rename/alignment.  
- Auth + role UX (middleware, hooks, invitations) must be wired exactly per `docs/AUTH_ROLE_ARCHITECTURE_SPECIFICATION.md`.  
- `.env` hygiene and duplicate lockfiles cause Next.js warnings; clean-up is pending.

### Coming up next
- Implement edge functions for EPC/Flood/HMLR/Planning data and surface them via cards/hooks.  
- Add regression tests for RLS and role flows.  
- Ship usability polish: toasts, error/empty states, accessibility checks, and baseline analytics/logging.

---

## 5. Simple Glossary

- **UPRN:** Unique Property Reference Number (the UK’s canonical property ID).  
- **PPUK Passport:** The full data bundle (details, docs, media, tasks, roles, API feeds) for one property.  
- **RLS:** Row Level Security; Postgres feature that enforces per-row access rules.  
- **Stakeholder:** Any user with a role on a property (owner, agent, surveyor, buyer, etc.).  
- **Edge Function:** Supabase serverless function (Deno) used to call external APIs safely.  
- **Signed URL:** Temporary link generated by Supabase Storage so private files can be downloaded securely.

---

## 6. Quick Links & Commands

| Action | Command / File |
| --- | --- |
| Install deps & run frontend | `cd frontend && npm install && npm run dev` |
| Run lint/tests/build (frontend) | `npm run lint && npm run test && npm run build` |
| Supabase migrations | `supabase db reset` (local) / `supabase db push` (remote) |
| Generate Supabase types | `supabase gen types typescript --linked > frontend/types/supabase.ts` |
| Docs index | `docs/README.md` |
| Blueprint (latest) | `docs/PPUK_V7_COMPLETE_BLUEPRINT_V2.md` |
| Auth & roles spec | `docs/AUTH_ROLE_ARCHITECTURE_SPECIFICATION.md` |

---

## 7. Suggested Next Tasks (chronological)

1. **Env & tooling hygiene** — clean `.env` handling, remove duplicate lockfiles, document secrets bootstrap.  
2. **Frontend v7 alignment** — update actions/components/types to use the new `documents`, `media`, `tasks`, `property_stakeholders` tables.  
3. **Auth & role UX** — implement middleware, guards, invitations, and role change flows exactly per the auth spec.  
4. **Edge functions + API cards** — build EPC/Flood/HMLR functions, wire React Query hooks, drop the placeholder data in UI cards.  
5. **RLS + E2E tests** — add automated coverage for every role/table action, plus an end-to-end smoke run.  
6. **Observability & launch prep** — finish logging/monitoring, health/readiness endpoints, backup/DR docs, and final accessibility/performance passes.

Keep updating this checklist as progress continues so new contributors always know the true state of the build.

---

**Remember:** when docs and code diverge, **code wins**—but update the docs afterwards. This blueprint is your map; the repo itself is the territory. Happy shipping!
