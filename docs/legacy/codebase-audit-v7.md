Deprecated: see docs/reports/ENGINEERING_AUDIT_V7.md for the canonical audit.
## Property Passport UK v7.0 — Codebase Audit (Baseline)

**Date**: 2025-11-29  
**Scope**: Full monorepo (backend, frontend, Supabase, CI, docs) at commit `initial import v7.0`.

---

## 1. Repository & High-Level Architecture

- **Monorepo root**
  - Backend Node/Express app (compiled to `dist/`, sources in `src/`).
  - Frontend Next.js 16 App Router app under `frontend/`.
  - Supabase project config and SQL migrations under `supabase/`.
  - Central documentation under `docs/`.
  - GitHub Actions CI under `.github/workflows/ci.yml`.
- **Architecture style**
  - Backend: layered Express app (`config → routes → controllers → services → (future models/repositories) → Supabase`).
  - Frontend: Next.js App Router with server components, server actions, and React Query (providers wired, hooks to be added).
  - Data: Supabase Postgres with strong RLS, helper functions, RPCs as the main integration surface.
  - Storage: Supabase Storage buckets `property-documents` and `property-photos`, accessed via server actions and signed URLs.

---

## 2. Backend (Node/Express) Overview

**Location**: `src/` (compiled JS in `dist/`).

### 2.1 Structure

- `src/app.ts`
  - Express app factory.
  - Sets up core middleware: `helmet`, `cors`, JSON/urlencoded parsing, disables `x-powered-by`.
  - Registers routes from `src/routes/index.ts`.
  - Central not-found and error-handling middleware from `src/middlewares/error-handler.ts`.
- `src/server.ts`
  - HTTP server bootstrap with graceful shutdown hooks.
  - Ties `app.ts` to a listening port.
- `src/routes/`
  - `health.ts`: `GET /health` endpoint, with matching unit test in `src/tests/health.test.ts`.
  - `index.ts`: route registration; ready for domain routes (properties, documents, media, tasks, notes, roles).
- `src/middlewares/`
  - `error-handler.ts`: central error handler, hides internals and stack traces from clients.
- `src/config/env.ts`
  - Environment configuration loader.
  - Meant to read from `.env`, with defaults documented via `.env.example` (currently incomplete; see gaps).
- `src/controllers/`, `src/services/`, `src/validators/`, `src/integrations/`, `src/utils/`
  - Present as thin, documented index modules and readmes.
  - Intentionally scaffolded for future feature work (currently minimal/no domain logic).

### 2.2 Behaviour & Quality

- **Implemented**
  - Server boots cleanly; basic health check works and is tested.
  - Centralized error handling avoids leaking stack traces.
  - Code style conforms to TypeScript strict mode and ESLint configuration.
  - Vitest in place with a sample health test.
- **Not yet implemented**
  - No production API surface yet for:
    - Property CRUD/search.
    - Documents/media listing or mutations.
    - Tasks/notes management.
    - Roles & access management.
    - Dashboard/analytics aggregation.
  - No Zod-based validation for request bodies/params on backend routes.
  - No rate limiting middleware for sensitive routes (auth, upload, role management).
  - No structured logging (JSON logs) or readiness endpoint with dependency checks.

**Conclusion**: Backend is a well-structured scaffold ready to host domain HTTP APIs, but domain endpoints are not wired yet—the current app relies primarily on direct Supabase access from frontend server actions.

---

## 3. Frontend (Next.js) Overview

**Location**: `frontend/` (Next.js 16, React 19, Tailwind + shadcn).

### 3.1 Structure

- `frontend/src/app/`
  - `layout.tsx`: root layout, pulls in global providers and shell.
  - `page.tsx`: landing/home page with PPUK framing.
  - Route groups:
    - `/auth/login`, `/auth/register`: auth pages (Supabase auth integration in progress).
    - `/dashboard`: personalised dashboard (properties + activity + KPIs).
    - `/properties`:
      - List: `/properties`.
      - Detail: `/properties/[id]`.
      - Create: `/properties/create`.
      - Edit: `/properties/[id]/edit`.
      - Error/loading/not-found boundaries for robustness.
    - `/search`: global property search page (UPRN/address/postcode).
    - `/p/[slug]`: public, read-only property passport.
  - `providers.tsx`: wraps React Query + Supabase providers.
- `frontend/src/components/layout/`
  - `app-shell.tsx`, `navbar.tsx`, `sidebar.tsx`, `footer.tsx`, `global-search.tsx`.
  - `GlobalSearch` navigates to `/search?q=...`.
- `frontend/src/components/property/`
  - Core panels:
    - `property-header.tsx`: hero, status badge, UPRN, edit button, public passport controls.
    - `property-meta.tsx`: address + key metadata.
    - `property-gallery.tsx`: photo/floorplan gallery with upload + delete.
    - `property-documents.tsx`: document table with upload + delete and signed URLs.
    - `property-access.tsx`: roles and access management.
    - `property-events.tsx`: activity/event timeline from `property_events`.
    - `property-flags.tsx`: RLS-aware flags and compliance panel.
  - Collaboration:
    - `tasks/` (`task-list.tsx`, `create-task-dialog.tsx`).
    - `notes/` (`note-list.tsx`, `create-note-dialog.tsx`).
  - Access management:
    - `grant-access-dialog.tsx`, `remove-access-dialog.tsx`.
  - Media/document management:
    - `upload-document-dialog.tsx`, `delete-document-dialog.tsx`.
    - `upload-photo-dialog.tsx`, `delete-media-dialog.tsx`, `delete-media-button.tsx`.
- `frontend/src/components/public-passport/`
  - `public-hero.tsx`, `public-metadata.tsx`, `public-gallery.tsx`, `public-documents.tsx` for `/p/[slug]`.
- `frontend/src/components/dashboard/`
  - `property-card.tsx`: dashboard card with completion bar and quick actions.
  - `access-card.tsx`: card summarising access role and expiry.
  - `kpi-card.tsx`: generic KPI tiles.
  - `recent-activity.tsx`, `activity-timeline.tsx`: event streams for dashboard.
- `frontend/src/actions/` (server actions)
  - `upload-property-document.ts`, `delete-property-document.ts`.
  - `upload-property-photo.ts`, `delete-property-media.ts`.
  - `grant-property-role.ts`, `revoke-property-role.ts`.
  - `set-public-visibility.ts` (toggles public visibility + regenerates slug).
  - `tasks.ts` (create task, create note).
- `frontend/src/lib/`
  - `supabase.ts`, `supabase-server.ts`: Supabase clients for client/server.
  - `signed-url.ts`: helpers for creating signed URLs.
  - `role-utils.ts`, `document-utils.ts`, `utils.ts`: small utility modules.
- `frontend/src/providers/`
  - `supabase-provider.tsx`: Supabase session provider integration.
  - `query-provider.tsx`: React Query provider.

### 3.2 Behaviour & Quality

- **Implemented**
  - All major user journeys at the UI layer:
    - Create property (form + server action + event log).
    - View and edit property.
    - Upload/delete documents and photos (with validation and event logging).
    - Manage roles (grant/revoke).
    - Toggle and view public passports.
    - View flags & compliance.
    - View and create tasks and notes.
    - Global search and dashboard summary with RPC-driven data.
  - Heavy use of **server actions** for all sensitive flows; no direct client-side Supabase service-role usage.
  - Signed URLs are used for media/documents; raw storage paths are not exposed directly to end users.
  - TypeScript strict is on; all JSX components use `React.ReactElement` return types; RPC args and return types use generated Supabase types.
  - ESLint and TypeScript both pass with zero outstanding issues (remaining `any` usages are explicitly documented and lint-suppressed at the call site for Supabase RPC inference gaps).
- **Not yet complete**
  - Auth UX: login/register exist but full session flows and protected route patterns need verifying and hardening.
  - Cross-cutting UX:
    - Toasts are present in patterns but end-to-end user notification flow should be re-reviewed.
    - Some loading/empty/error states likely need additional polish across pages.
  - React Query integration:
    - Providers are set up, but many data flows still lean on server components and server actions directly rather than reusable hooks (`useProperties`, `useDashboard`, `usePropertyDetail`).

**Conclusion**: Frontend implements almost all PPUK v7 core flows at a UI + server-action level and is production-build-ready. Remaining work is primarily around auth hardening, test coverage, and consistency of data-fetching hooks.

---

## 4. Supabase (DB, RLS, RPCs, Storage)

**Location**: `supabase/` and `src/types/supabase.ts` / `frontend/src/types/supabase.ts`.

### 4.1 Schema & Tables

Key tables (from migrations + blueprint):

- `properties`
  - Core passport: id, uprn, display_address, address lines, city, postcode, status, coordinates.
  - Ownership metadata: `created_by_user_id`, timestamps, soft-delete via `deleted_at`.
  - Public passport fields: `public_slug`, `public_visibility`.
- `user_property_roles`
  - Role assignments: `owner`, `admin`, `agent`, `surveyor`, `conveyancer`, `buyer`, `tenant`, `viewer`, etc.
  - `expires_at` for time-bound access.
- `property_documents`
  - Document metadata: title, `document_type` (title/survey/search/identity/contract/warranty/planning/compliance/other).
  - Storage path, MIME type, size, version, status, `created_by_user_id`.
- `property_media`
  - Media metadata: `media_type` (photo/floorplan/other), storage path, MIME, status, `uploaded_by_user_id`.
- `property_events`
  - Event log: event_type (create/update/document_uploaded/document_deleted/media_uploaded/media_deleted/role_granted/role_revoked/flag_* etc.), payload JSON, `actor_user_id`, timestamp.
- `property_flags`
  - Compliance and data-quality flags, with severity, status, and RLS-aware visibility.
- `property_tasks`, `property_notes`
  - Internal collaboration tables:
    - Tasks: title, description, status, priority, due date, assignees.
    - Notes: content with type (general/inspection/maintenance/legal/system), privacy flags.

### 4.2 RLS & Helper Functions

- RLS is **enabled** on all user-data tables.
- Helper functions (`20241201000001_rls_helper_functions.sql` and recreated via reset migrations):
  - `is_admin()`, `has_property_role(property_id, allowed_roles text[])`.
  - Helpers for creator/owner checks and document/media access decisions.
- Policies (`20241201000002_rls_policies.sql` and subsequent migrations):
  - **Properties**: visibility governed by creator, assigned roles, and `public_visibility` flag for anonymous.
  - **Documents/media**: access limited by roles and status; no anonymous write access.
  - **Tasks/notes**: role-stratified access matching blueprint (owners/admin/agents full; professionals can add notes; buyers/tenants read-only or filtered; others none).

### 4.3 RPCs

Key RPCs (from migrations):

- `create_property_with_role`
  - Atomic insert of property, owner role, and initial event.
- `update_property_with_event`
  - Updates property fields and logs before/after diff in `property_events`.
- `search_properties(query_text)`
  - Fuzzy search by UPRN, display_address, and postcode with relevance scoring and RLS enforcement.
- `get_user_properties(user_id default auth.uid())`
  - Returns all properties visible to a user, including `role`, `access_expires_at`, and featured media.
- Dashboard RPCs:
  - `calculate_property_completion(property_id)`: returns 0–100 completion score based on details, docs, photos, roles, flags, events, status.
  - `get_recent_activity(auth_uid)`: RLS-aware event feed for properties the user owns/has roles on (last 30 days).
  - `get_dashboard_stats(auth_uid)`: high-level counts (owned, managing, temporary, unresolved flags, documents, media).
- Public passport RPCs:
  - `get_public_property(slug)`: safe projection for anonymous public view (no sensitive fields).
  - `set_public_visibility(property_id, visible boolean)`: owner/admin-only toggle for `public_visibility`.
  - `regenerate_slug(property_id)`: regenerates slug based on address/postcode; restricted to owner/admin.
- Tasks & notes:
  - `get_property_tasks(property_id)`, `get_property_notes(property_id)`: RLS-filtered listings for UI.
- Featured media:
  - `get_featured_media(property_id)`: used for hero images and dashboard cards.

### 4.4 Storage

- Buckets:
  - `property-documents`: private, 20MB limit per document (complementary frontend Zod validation).
  - `property-photos`: private, 10MB limit per media object.
- Policies:
  - Insert/select/update/delete scoped to authenticated users with permitted roles.
  - Frontend uses signed URLs for read access; no public bucket exposure.

**Conclusion**: Supabase is correctly set up as the primary data layer with RLS-first design and RPCs for all complex or multi-step operations. RLS/reset migrations were recently stabilised; regression tests are still needed.

---

## 5. CI/CD (GitHub Actions)

**File**: `.github/workflows/ci.yml`

- **Triggers**
  - On `push` to `main`.
  - On all `pull_request`s.
- **Concurrency**
  - Per-branch group, cancels in-progress run when a new push arrives.

### 5.1 Backend job

- Runs on `ubuntu-latest`.
- Steps:
  - Checkout.
  - Setup Node 20 with `actions/setup-node@v4`, caching via root `package-lock.json`.
  - `npm ci`.
  - `npm run lint`.
  - `npm run typecheck`.
  - `npm test`.
  - `npm run build`.

### 5.2 Frontend job

- Runs on `ubuntu-latest`.
- Working directory: `frontend/`.
- Env for Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321`.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY: test-anon-key`.
- Steps:
  - Checkout.
  - Setup Node 20 (cache by `frontend/package-lock.json`).
  - `npm ci`.
  - `npm run lint`.
  - `npm run typecheck`.
  - `npm test`.
  - `npm run build`.

**Conclusion**: CI is already wired for both backend and frontend, enforcing lint, typecheck, test (placeholder currently), and build. Once backend APIs and more tests are added, this pipeline will give strong protection.

---

## 6. Environment & Secrets

### 6.1 Current state

- `.gitignore` (root) correctly ignores:
  - `.env`, `.env.*`, `.env.local`, `.env.*.local`.
  - `.supabase`, `node_modules`, `.next`, `.turbo`, `pnpm-lock.yaml`, `yarn.lock`, etc.
- Root files present:
  - `.env` (currently **tracked** in workspace listing; must be untracked in git if added earlier).
  - `.env.example` (currently sparse; needs to be turned into definitive template).
  - `.env.supabase-cli` (CLI auth; should not be used in production environments).
- Frontend:
  - `frontend/.env.example` exists with Next.js/Supabase placeholders.
  - `frontend/.env.local` exists locally (ignored by git as long as `.gitignore` in `frontend` covers it).
  - Code references:
    - `process.env.NEXT_PUBLIC_SUPABASE_URL`.
    - `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 6.2 Recommended `.env.example` (root)

- Root `.env.example` should:
  - Not contain real Supabase keys; only placeholders.
  - Document which envs are for:
    - Backend tooling / local CLIs.
    - Frontend (mirroring `frontend/.env.example`).
    - CI and production.
- High-level example (to be refined and applied separately):
  - `NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here`
  - `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here` (only for backend/CI).
  - `NODE_ENV=development`
  - Optional: `DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `API_BASE_URL`, etc.

### 6.3 Required cleanup

- **Immediate**
  - Run `git ls-files ".env*"` to confirm if any env files are tracked.
  - If so, run `git rm --cached .env .env.*` and commit a cleanup.
  - Rotate any Supabase keys that were ever present in `.env` committed history (already recommended).
- **Documentation**
  - Add a short "Environment Bootstrap" section in `docs/README.md` or `docs/current_state_and_next_steps.txt` linking:
    - Which env vars are required for dev.
    - Where to set them for CI.
    - Where to set for Vercel (when configured).

---

## 7. Testing & Quality Status

### 7.1 Backend

- Tests:
  - `src/tests/health.test.ts`: verifies `/health` endpoint.
- Missing:
  - Unit tests for controllers/services (once implemented).
  - Integration tests for Supabase-backed flows (RPC calls, RLS behaviours).
  - Regression tests for error-handling and rate-limiting (when added).

### 7.2 Frontend

- `npm test` currently is a placeholder (`"No frontend tests yet"`).
- Missing:
  - Unit tests for business components (property header, documents, gallery, flags, tasks/notes).
  - Integration tests for server actions (document/photo upload, deletion, role changes, visibility toggle).
  - E2E flows (auth → create property → upload doc/photo → assign role → toggle visibility → public view).

### 7.3 RLS & Storage Regression Testing

- Not yet implemented:
  - Automated tests that:
    - Seed users with each role (owner/admin/agent/surveyor/conveyancer/buyer/tenant/viewer) + anonymous.
    - Verify access matrices for:
      - Property visibility.
      - Documents/media (read/write/delete).
      - Tasks/notes (view/create/update/delete).
      - Flags, events, and dashboard RPCs.
    - Validate signed URLs are only usable by allowed principals and expire correctly.

---

## 8. Known Gaps & Next Moves (from `current_state_and_next_steps.txt` + audit)

### 8.1 Already captured in `docs/current_state_and_next_steps.txt`

- `.env.example` and env bootstrap documentation still pending.
- Backend domain API routes/controllers/services not yet implemented.
- Request validation, rate limiting, logging, and readiness endpoints missing.
- RLS/storage regression tests not yet built.
- Frontend auth flows and some dashboard/property pages need completion & verification.
- Edge Functions and external integrations (EPC, HMLR, Flood, Postcodes.io, Police, OS, ONS) still to be added.

### 8.2 Additional findings from this audit

- **Embedded git repo under `frontend/`**:
  - `frontend/.git` still exists in workspace; the root git repo already tracks `frontend` as a normal directory.
  - Recommendation: remove `frontend/.git` from disk to avoid confusion (`rm -rf frontend/.git`) and ensure only the root repo is canonical.
- **Build artefacts**
  - `dist/` and `frontend/.next/` are present, but `.gitignore` already excludes them; they should not be committed going forward.
- **Supabase CLI env**
  - `.env.supabase-cli` is present; safe for local CLI use but should not contain keys used in CI/prod; those belong in GitHub/Vercel secrets.

---

## 9. Recommended Execution Order From Here

1. **Secrets & Environment Hygiene**
   - Untrack any env files from git, ensure `.env.example` (root and frontend) contain only placeholders.
   - Rotate any Supabase keys that were ever exposed.
2. **Backend Domain API Layer**
   - Implement controllers/routes/services for:
     - Property CRUD and search (wrapping Supabase RPCs).
     - Documents/media listing endpoints (complementing direct Supabase storage flows).
     - Tasks/notes and roles (for potential non-Next.js consumers and future integrations).
   - Add Zod validators and rate limiting where appropriate.
3. **Frontend Auth & Data Hooks**
   - Finalise Supabase auth flows (login/logout/register, session hydration, protected routes).
   - Introduce typed React Query hooks over server actions for dashboard, properties, tasks, notes.
4. **RLS & Storage Regression Suite**
   - Build dedicated test suites to exercise RLS, role-based access, expiry windows, and signed URLs.
5. **Edge Integrations & Observability**
   - Add Edge Functions for external data sources with Zod validation and caching.
   - Introduce structured logging and monitoring for key flows.

This document should remain the living "audit snapshot" for the v7.0 baseline; future structural changes should update this file alongside `docs/project-tree.md` and `docs/current_state_and_next_steps.txt`.

