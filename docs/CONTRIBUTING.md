# Contributing

Thanks for contributing to the Property Passport UK platform. This repo is a Next.js 16 App Router frontend backed by Supabase (Postgres + RLS). Please follow the guidance below to keep quality high and consistent.

## Ground rules
- Application code lives in `frontend/` (app, components, actions, lib, hooks, providers, types). Supabase schema/RLS/RPCs live in `supabase/` (migrations, seed). Docs live in `docs/`.
- No secrets or credentials in code or config — use environment variables and update `.env.example` when adding new required values.
- Validate and sanitize external inputs; never expose stack traces to clients.
- Favor small, focused changes; avoid “god files”.

## Coding standards
- TypeScript strict mode; prefer explicit types where clarity helps.
- Use async/await for async flows; avoid callbacks.
- Keep error handling centralized in server actions and API routes; prefer reusable helpers.
- Follow lint/format rules (`eslint` + `prettier`); run `npm run lint` (from `frontend/`) and format as needed.
- Tests: add/maintain unit/integration tests alongside features; `npm test`/`npm run test` (if added) must pass.

## Commit and PR guidelines
- Commit messages: concise, imperative (e.g., "Add health endpoint", "Fix lint config"). Conventional Commit style is welcome but not required.
- Keep commits logically grouped; avoid mixing unrelated changes.
- Before opening a PR: ensure `npm run lint` and `npm run build` (from `frontend/`) succeed; update docs when behavior/config changes.
- PRs should describe scope, testing performed, and any follow-up work or risks.

## Tooling
- Husky runs lint-staged on pre-commit to auto-lint/format staged files (check `.husky/`).
- Preferred scripts:
  - `cd frontend && npm run dev` — local development
  - `cd frontend && npm run lint` — linting
  - `cd frontend && npm run build` — Next.js build
  - Supabase: `supabase db reset` / `supabase db push` for local schema, `supabase gen types typescript --linked > frontend/types/supabase.ts` to refresh types.

## Getting started
1. Install Node 20+ (see `.nvmrc`).
2. `cd frontend && npm install`
3. Copy `frontend/.env.example` to `frontend/.env.local` and configure Supabase URL/anon key.
4. `npm run dev` from `frontend/` to start the app.
5. For schema changes: edit `supabase/migrations/`, run Supabase CLI locally, regenerate types.
6. Make changes with tests/linting/build; commit when clean.

## Documentation
- Update `./README.md` and `docs/` when behavior or schema changes (see `docs/README.md` for canonical doc list).
- Record known gaps or TODOs in code or backlog docs when deferring work.
