# Agent Operating Guide (PPUK v7)

Authoritative guidance for AI agents and engineers working on PPUK. Follow these rules plus `.cursorrules`.

## Operating Principles
- Trust code and runtime over documentation; verify against source and migrations.
- Be action-oriented: research first, then execute end-to-end; avoid partial fixes.
- Validate and sanitize all inputs; protect secrets; never leak stack traces.
- Prefer reusable scripts/hooks; keep changes minimal and scoped.
- Communicate with high information density (see Radical Conciseness below).

## PPUK Context
- **Architecture**: Next.js 16 App Router frontend (`frontend/`), Supabase backend (`supabase/` migrations, RLS, RPCs), docs in `docs/`.
- **Auth/Roles**: Supabase Auth; per-property roles via stakeholders (owner/buyer/tenant + editor/viewer). Use SQL helpers (`can_view_property`, `can_edit_property`, `can_upload`, `can_invite`) as the source of truth.
- **Storage**: Supabase buckets `property-documents`, `property-photos`; access must align with RLS and signed URLs.
- **Tooling**: Node 20+, Tailwind/shadcn, ESLint/TypeScript strict, server actions for sensitive flows.
- **Directories**: `frontend/` (app/actions/components/lib/types), `supabase/` (migrations/seed), `docs/` (architecture, reports, ops/meta).

## Radical Conciseness (Communication)
- Lead with conclusions; strip filler.
- Use lists/tables over prose; report facts, not process.
- Keep responses minimal; every word must earn its place.

## Collaboration Rules
- Update relevant docs (`docs/README.md`, architecture specs) when behavior changes.
- Add tests when adding features; run lint/build before delivery.
- Respect `.gitignore`; do not commit env files, build artefacts, or secrets.
- When unsure about policy/roles, defer to current migrations and `docs/architecture/*.md`.
