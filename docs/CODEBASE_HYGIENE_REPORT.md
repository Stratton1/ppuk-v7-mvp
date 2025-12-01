# Codebase Hygiene Report — Property Passport UK v7

## Overview (pre-change state)
- Repo contains Next.js 16 App Router frontend in `frontend/`, Supabase backend migrations in `supabase/`, and extensive docs in `docs/`.
- Legacy v6 tables are dropped at DB level, but some code still referenced v6 names and deprecated docs.
- Cursor rules referenced an outdated `/src` layout; docs entry point was not canonical.
- Notes and flags subsystems referenced non-existent v6 tables; Supabase client typing friction remained.

## Changes performed

### Code hygiene / refactors
- Regenerated Supabase types from the linked project: `frontend/types/supabase.ts`.
- Updated Supabase server client typing to avoid cookie getter type errors (`frontend/lib/supabase/server.ts`).
- Middleware admin role check now safely extracts role names (`frontend/middleware.ts`).
- Replaced remaining v6 table usage:
  - `property-flags.tsx` replaced with a v7-safe placeholder (flags table not present in v7).
  - `property-events.tsx`, `property-documents.tsx`, `property-access.tsx` now use v7 `users` table lookups.
  - `property-gallery.tsx` uses `media` (v7) instead of `property_media`.
  - `task-list.tsx` uses `tasks` (v7) instead of `property_tasks`.
  - Document utils now type against v7 `documents` table.
- Login page wrapped in Suspense to satisfy Next App Router CSR bailouts.
- Notes components marked @deprecated placeholders (v6 table removed).

### Dead code / legacy handling
- `frontend/components/property/property-flags.tsx` stubbed (no v7 `property_flags` table).
- Notes subsystem remains disabled; placeholders documented with @deprecated.
- No migrations or seeds altered.

### Docs and README updates
- Replaced `docs/README.md` with a canonical index reflecting the Next.js + Supabase stack, run instructions, and key doc links.
- Marked `docs/PPUK_V7_COMPLETE_BLUEPRINT.md` as deprecated in favor of V2.
- Added this hygiene report (`docs/CODEBASE_HYGIENE_REPORT.md`).

### Cursor rules alignment
- Updated `.cursorrules` and `.cursor/rules/propertypassportv7rules.mdc` to reflect the current frontend location (`frontend/`), Next.js 16/React 19 stack, Supabase SSR clients, and storage buckets. Removed outdated `/src` layout guidance.

## Files changed (key)
- `.cursorrules`
- `.cursor/rules/propertypassportv7rules.mdc`
- `docs/README.md`
- `docs/PPUK_V7_COMPLETE_BLUEPRINT.md`
- `docs/CODEBASE_HYGIENE_REPORT.md` (new)
- `frontend/lib/supabase/server.ts`
- `frontend/middleware.ts`
- `frontend/components/property/property-events.tsx`
- `frontend/components/property/property-documents.tsx`
- `frontend/components/property/property-access.tsx`
- `frontend/components/property/property-gallery.tsx`
- `frontend/components/property/tasks/task-list.tsx`
- `frontend/components/property/property-list.tsx`
- `frontend/lib/document-utils.ts`
- `frontend/components/property/notes/create-note-dialog.tsx` (deprecated placeholder)
- `frontend/components/property/notes/note-list.tsx` (deprecated placeholder)
- `frontend/components/property/property-flags.tsx` (stub)
- `frontend/app/auth/login/page.tsx`
- `frontend/types/supabase.ts` (regenerated)
- `frontend/.env.local` (ensures required env for build; contains anon key only)

## Items left untouched but noteworthy
- `supabase/seed.sql` remains v6-oriented; not modified (requires dedicated migration/seed rewrite for v7).
- CI workflow and root `package.json` scripts still assume `next ... frontend`; align with chosen package layout before release.
- Middleware deprecation warning (Next.js suggests `proxy`); not addressed in this pass.
- Baseline-browser-mapping warnings from Next build; update dependency separately.

## How to keep it clean
- Regenerate Supabase types after any DB change: `supabase gen types typescript --linked > frontend/types/supabase.ts`.
- Run `npm run build` under Node ≥20.19.6 to surface schema/TS regressions early.
- Avoid reintroducing v6 tables (property_notes, property_tasks, property_media, property_documents, users_extended, user_property_roles, property_flags, audit_logs).
- Keep docs/README as the canonical entry point; mark older docs with a deprecation note rather than duplicating content.
- Follow the rules in `.cursorrules` / `.cursor/rules/propertypassportv7rules.mdc` for security/RLS and architecture.
- If re-enabling flags or notes, add proper v7 schema/migrations and RLS first, then rewire UI and types.
