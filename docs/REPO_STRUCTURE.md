# Repository Structure (PPUK v7)

Canonical overview of the repo layout and responsibilities.

## High-Level Tree
```
.
├── docs/             # Architecture, reports, ops/meta docs (canonical entry: docs/README.md)
├── frontend/         # Next.js 16 App Router frontend (primary application)
├── supabase/         # Postgres schema, RLS, RPCs, storage config, seed
├── lovable/          # Archived Lovable UI export (reference only)
├── eslint.config.js  # Root lint config (superseded by frontend/eslint.config.mjs)
├── package.json      # Legacy root manifest (see frontend/package.json for app)
└── tsconfig.json     # Legacy root TS config (frontend/tsconfig.json is primary)
```

## Root
- **Configs**: Legacy `package.json` (scripts updated to work from root, but `frontend/package.json` is canonical), `tsconfig.json`, `eslint.config.js` (primary configs live under `frontend/`).
- **Tooling**: `.github/workflows/`, `.husky/`, `.nvmrc`, `.prettier*`, `vitest.config.ts`, `verify_schema.sql`.
- **Environment**: `.env.example` (template), `.gitignore` (excludes `.env*` files and build artifacts).
- **Docs**: See `docs/README.md` for navigation. See `docs/ENVIRONMENT_SETUP.md` for environment configuration.

## Frontend (Next.js App)
- **Path**: `frontend/`
- **Purpose**: Next.js 16 App Router app with Supabase SSR, server actions, Tailwind/shadcn UI.
- **Key areas**:
  - `app/`: Routes (`/auth`, `/dashboard`, `/properties`, `/search`, `/p/[slug]`, `/tasks`, `/invitations`, `/settings`) plus API routes (`/api/me`, `/api/property-access/[propertyId]`), layout/providers, globals.
  - `actions/`: Server actions for documents/media, roles, visibility, tasks.
  - `components/`: Layout shell, dashboard widgets, property modules, public passport, UI primitives.
  - `hooks/`: Supabase/session helpers.
  - `lib/`: Auth helpers, role utils, Supabase clients, shared utilities.
  - `providers/`: Supabase + React Query providers.
  - `types/`: Generated Supabase types plus app auth/forms types.
  - `public/`: Static assets (SVGs).
  - `configs`: `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, `components.json`, `tsconfig.json`, `postcss.config.mjs`.

## Supabase
- **Path**: `supabase/`
- **Purpose**: Source of truth for schema, RLS, RPCs, storage, and seed data.
- **Key areas**:
  - `migrations/`: Versioned SQL migrations (schema, RLS, RPCs, storage buckets, role/permission refactors, legacy drops).
  - `seed.sql`: Sample data aligned to v7 schema.
  - `.temp/`, `.branches/`: Supabase CLI metadata (non-source).
  - `config.toml`: Supabase project configuration.

## Docs
- **Path**: `docs/`
- **Purpose**: Canonical documentation for architecture, reports, ops scripts, meta/agent guidance, and roadmaps. See `docs/README.md` for the authoritative index.

## Legacy / Reference
- **lovable/**: Archived design export; not part of build pipeline.
- **frontend/.next**, `frontend/node_modules` (if present): Build artefacts/vendor installs; should not be committed.
