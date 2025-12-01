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
4) Env: ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no secrets in client).

## Documentation map (source of truth)
- **Architecture & Blueprint:** `PPUK_V7_COMPLETE_BLUEPRINT_V2.md` (canonical), `PPUK_V7_COMPLETE_BLUEPRINT.md` (deprecated for context).
- **Auth & Roles:** `AUTH_ROLE_ARCHITECTURE_SPECIFICATION.md`
- **Schema & RLS:** `SCHEMA_ARCHITECTURE_SPECIFICATION.md`, `SCHEMA_VERIFICATION_REPORT.md`, `RLS_POLICY_PLAN.md`
- **Roadmap & Current State:** `roadmap.md`, `current_state_and_next_steps.txt`, `codebase-audit-v7.md`
- **Hygiene Reports:** `CODEBASE_HYGIENE_REPORT.md`
- **Legacy removal plan:** `LEGACY_SCHEMA_REMOVAL_PLAN.md`

## Notes
- Legacy v6 tables (`property_notes`, `property_tasks`, `property_media`, `property_documents`, `users_extended`, `user_property_roles`, `property_flags`, `audit_logs`) are dropped; do not reference them.
- Use Supabase clients from `frontend/lib/supabase` and v7-generated types in `frontend/types/supabase.ts`.
- Refer to `.cursorrules` and `.cursor/rules/propertypassportv7rules.mdc` for enforced engineering rules.
