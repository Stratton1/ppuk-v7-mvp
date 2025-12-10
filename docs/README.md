# Property Passport UK v7 — Canonical Guide

This repository contains the Next.js 16 frontend (App Router) backed by Supabase (Postgres + RLS) for the Property Passport UK v7 platform.

## Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind + shadcn/ui.
- **Backend:** Supabase (typed clients via `@supabase/ssr`), RLS enforced, buckets `property-documents` and `property-photos`.
- **Location:** App code in `frontend/` (app, components, actions, lib, hooks, providers, types). Supabase migrations in `supabase/`.

## How to run locally
1) Node **≥20.19.6** (use `nvm use 20`).  
2) Supabase CLI linked (`supabase link`).  
3) Install & build:
```bash
cd frontend
npm install
npm run build
npm run dev
```
4) Env: ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no secrets in client). See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed setup instructions.

**Note:** The root `package.json` is legacy. All development commands should be run from the `frontend/` directory using `frontend/package.json`.

## Documentation map (canonical)
- **Blueprints & Orientation**: `PPUK_V7_COMPLETE_BLUEPRINT_V2.md` (canonical), `BEGINNER_ROADMAP_BLUEPRINT.md`, `REPO_STRUCTURE.md` (repo map). v1 blueprint lives in `legacy/` for reference.
- **Architecture** (`architecture/`): `AUTH_ROLE_ARCHITECTURE_SPECIFICATION.md`, `SCHEMA_ARCHITECTURE_SPECIFICATION.md`, `RLS_ARCHITECTURE_V7.md`.
- **Reports** (`reports/`): `ENGINEERING_AUDIT_V7.md` (canonical audit), `SCHEMA_VERIFICATION_REPORT.md`, `RLS_VERIFICATION_REPORT.md`, `CODEBASE_HYGIENE_REPORT.md`.
- **Ops** (`ops/`): `SMOKE_TEST_SCRIPT_ROLES_V7.md`, `current_state_and_next_steps.txt`.
- **Meta** (`meta/`): `AGENT_OPERATING_GUIDE.md`, `refresh.md`, `continue.md`, `frontendconsider.md`.
- **Roadmap**: `roadmap.md`.

## Notes
- Legacy docs retained under `docs/legacy/` for historical reference (e.g., `PPUK_V7_COMPLETE_BLUEPRINT.md`, `LEGACY_SCHEMA_REMOVAL_PLAN.md`, `RLS_POLICY_PLAN.md`).
- Use Supabase clients from `frontend/lib/supabase` and v7-generated types in `frontend/types/supabase.ts`.
- Refer to `.cursorrules` and `.cursor/rules/propertypassportv7rules.mdc` for enforced engineering rules.

## Notes
- Legacy v6 tables (`property_notes`, `property_tasks`, `property_media`, `property_documents`, `users_extended`, `user_property_roles`, `property_flags`, `audit_logs`) are dropped; do not reference them.
- Use Supabase clients from `frontend/lib/supabase` and v7-generated types in `frontend/types/supabase.ts`.
- Refer to `.cursorrules` and `.cursor/rules/propertypassportv7rules.mdc` for enforced engineering rules.
