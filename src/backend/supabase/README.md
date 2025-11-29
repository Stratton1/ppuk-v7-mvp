# Supabase Backend Bootstrap

Authoritative references: `/docs/PPUK_V7_COMPLETE_BLUEPRINT*.md`, `/docs/user-roles.md`, `/docs/security.md`, `/docs/core.md`, `/docs/refresh.md`, `.cursorrules`, and `.cursor/rules/*.mdc`.

This directory holds Supabase SQL artifacts:
- `schema.sql` — table definitions, enums, constraints, storage bucket setup.
- `rls-policies.sql` — row-level security policies (pending approval before generation).
- `seed.sql` — non-sensitive seed data for development/testing.

Guidance:
- Use UPRN-centric property model; follow naming conventions from the blueprint.
- Enforce RLS for every table; no public access. Seek approval before adding policies.
- Use storage buckets `property-documents` and `property-photos` with signed URLs only.
- Include `api_cache`, `audit_log`, notifications, tasks/notes/watchlist per blueprint.
- Validate inputs via Zod in application layers; keep secrets out of SQL files.
- Keep seed data non-sensitive and environment-agnostic.

Current status: placeholders only; no RLS policies generated until explicit approval.
