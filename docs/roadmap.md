# Property Passport UK v7.0 — End-to-End Roadmap

Source of truth: `/docs` + `.cursorrules` + `.cursor/rules/*.mdc`. Architecture: Supabase backend (Postgres, RLS, Storage, Edge Functions), React/Vite/Tailwind/shadcn frontend, strict TypeScript, Zod validation, Edge Functions for all external APIs, no client-side secrets, least-privilege RLS.

## Critical Path & Milestones
- **Critical path:** Env/CI → Auth & RLS baseline → Schema & storage → Edge-function integration pattern → Property passport flows → External data integrations → Pro/Admin features → Security/perf hardening → Launch.
- **Milestones:**  
  - **M1 (W2):** Foundation/CI/auth shell in place.  
  - **M2 (W4):** Schema + RLS + storage + audit/cache operational with tests.  
  - **M3 (W6):** Property passport CRUD, uploads/gallery, tasks/notes/watchlist/notifications live with RLS.  
  - **M4 (W8):** Priority Edge Functions + cache + frontend data cards/hooks.  
  - **M5 (W10):** Role-aware UX, pro tools, reports/exports.  
  - **M6 (W12):** Admin console, audit views, analytics/ops docs.  
  - **M7 (W14):** Security/perf hardened, DR tested, launch-ready with runbooks.

## Timeline (14-week baseline)
- **W1-2:** Foundation (repo, CI/CD, envs, auth baseline, base UI shell).  
- **W3-4:** Core services (schema, RLS, storage, audit, cache).  
- **W5-6:** Core features (passport CRUD, uploads/media, tasks/notes/watchlist/notifications).  
- **W7-8:** Integrations (Edge Functions for priority gov APIs + cache + UI hooks/cards).  
- **W9-10:** User/pro features (role UX, reports/exports, consent).  
- **W11-12:** Admin/analytics/ops.  
- **W13-14:** Hardening, perf, DR, launch.

## Phase 1 — Foundation (W1-2)
**Goals:** Reliable scaffolding, CI/CD, auth baseline, coding standards.
- Repo & Tooling: ESLint/Prettier/Vitest; Husky + lint-staged; typecheck gate; Node 18+. (AI assist)
- CI/CD: GitHub Actions → lint → typecheck → test → build; npm cache; preview deploy hooks. (AI assist)
- Environments: `.env.example` for dev/stage/prod; secrets only in vault/CI; document bootstrap. (Human)
- Supabase: Project creation, service keys in CI secrets; enable Auth providers (magic/OTP, Google). (Human)
- Auth Baseline: Frontend guards, session handling via Supabase client; no client-side secrets. (AI assist)
- UI Shell: Vite/React/Tailwind/shadcn; layout, theming (navy/sky/slate), routing scaffold, error boundaries, toast. (AI assist)
- DoD: CI green; auth enabled; envs documented; shell renders.

## Phase 2 — Core Services & Data Model (W3-4)
**Goals:** Schema + RLS, storage, audit, cache.
- Schema: Tables for users/profiles, properties, property_parties, documents, media, api_cache, audit_log, notifications, watchlist, notes, tasks. (AI draft; Human approve)
- RLS: Role matrix per docs; policies per table; tests per role; least privilege. (AI generate tests; Human approve)
- Storage: Buckets `property-documents`, `property-photos`; signed URLs only; MIME/size checks; AV hook stub. (AI assist)
- Audit: Triggers for sensitive actions; structured JSON; no PII leaks in logs. (AI assist)
- API Cache: `api_cache` with TTL, checksum, source key; cache-first pattern. (AI assist)
- DoD: Migrations applied; RLS tests passing; storage configured; audit/cache live.

## Phase 3 — Core Features (W5-6)
**Goals:** Passport flows, docs/media, productivity tools.
- Passport CRUD: UPRN-anchored property create/read/update; party linkage; Zod validation; controllers/services wired. (AI assist)
- Tabs Scaffold: Summary, ownership, compliance, planning, risks, media, documents. (AI assist)
- Uploads & Media: Edge upload function with validation; metadata in DB; signed access; expiry rotation. (AI assist)
- Productivity: Tasks, notes, watchlist, notifications with RLS; unread counts; webhook/email placeholders. (AI assist)
- DoD: End-to-end passport CRUD; uploads/gallery; tasks/notes/watchlist/notifications working with RLS tests.

## Phase 4 — Integrations (W7-8)
**Goals:** Priority gov data via Edge Functions, cached and surfaced in UI.
- Edge Functions (Deno): EPC, Land Registry Open Data, Environment Agency Flood, Postcodes.io, Police.uk, Ordnance Survey, ONS (priority set). Validate with Zod, sanitize errors, rate-limit, cache-first. (AI assist; Human approve)
- Cache & Refresh: TTL invalidation, manual refresh endpoint, cache warming. (AI assist)
- Frontend Hooks/Cards: React Query hooks per source; loading/error states; UI cards per dataset. (AI assist)
- DoD: Functions deployed; cache populated; UI shows integrated data with skeleton/error states; integration tests passing.

## Phase 5 — User & Professional Features (W9-10)
**Goals:** Role-aware UX, pro tooling, reporting.
- Role UX: Owner/Buyer/Agent/Conveyancer/Surveyor/Admin routes, feature flags, guarded navigation. (AI assist)
- Pro Tools: Reports/exports (PDF/HTML) with sanitized data; task assignment across parties; chain visibility stub. (AI assist)
- Consent & Access: Invitations/role assignment; consent logging for data sharing; audit of access grants. (Human + AI)
- DoD: Role dashboards; reports export; consent + audit wired; RLS tests updated.

## Phase 6 — Admin, Analytics, Ops (W11-12)
**Goals:** Admin console, audit/ops visibility, analytics stubs.
- Admin Console: Role management, property moderation, document takedown, rate-limit tuning. (AI assist)
- Analytics: Server-side event stubs; dashboards for usage/perf; zero PII in logs. (AI assist)
- Ops: Health/readiness endpoints; alerting hooks; backup/restore runbook. (Human)
- DoD: Admin UI secured; audit views; basic analytics; ops docs drafted.

## Phase 7 — Hardening & Launch (W13-14)
**Goals:** Security, performance, DR, launch readiness.
- Security: Pen-test remediation list; CSP/headers; secret scanning; RLS regression suite. (Human lead)
- Performance: Profiling, slow-query review, cache tuning, image optimization. (AI assist)
- DR: Backup schedule verification; restore drill; incident runbook. (Human)
- Launch: Final QA/UAT signoff; documentation freeze; on-call rotations; cutover plan. (Human)
- DoD: All checks green; signoffs captured; runbooks published.

## Cross-Cutting Concerns
- **Validation:** Zod at all boundaries (forms, edge functions, controllers).  
- **Security/RLS:** No bypass; signed URLs only; no client secrets; structured sanitized errors; rate limiting on sensitive paths.  
- **Testing:** Unit (schemas/utils/hooks), integration (edge functions, RLS policies, storage flows), E2E (auth + passport + uploads + integrations). CI gates block on failures.  
- **CI/CD:** GitHub Actions for lint/type/test/build/deploy edge functions; stage preview; manual approvals to prod.  
- **Docs:** Keep `/docs` authoritative; update READMEs and module docs per change; record TODO/tech debt.  
- **Logging/Monitoring:** Structured logs sans PII; audit for sensitive actions; health/readiness endpoints.  
- **Compliance:** RLS coverage for every table; consent logging; storage access via signed URLs; no inline secrets.

## AI vs Human Responsibilities
- **AI (Cursor/Codex):** Scaffolding/config, schema drafts, RLS/test generation, edge function boilerplate, frontend hooks/cards, lint/test wiring, docs updates.  
- **Human:** Secret management, Supabase admin actions, RLS approval, production deployments, security/pen-test, legal/compliance, incident response, final QA/UAT signoff.

## Dependencies Summary
- Auth/env → RLS/schema → storage/audit/cache → passport flows → integrations → pro/admin → hardening/launch.  
- Edge-function pattern precedes any external API use; RLS tests precede exposing data; CI must be green before merge/deploy.
