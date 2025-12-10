Superseded by docs/meta/AGENT_OPERATING_GUIDE.md.
# AGENTS: Property Passport UK Platform (v7) Guidance

Audience: AI agents and engineers collaborating on this codebase. Follow `.cursorrules` and keep architecture clean, secure, and tested.

## Fast context
- Language/runtime: TypeScript on Node 18+; Express server in `src/server.ts` using `src/app.ts` factory.
- Key middleware: `helmet`, `cors`, JSON/urlencoded parsing, centralized error handling (`src/middlewares/error-handler.ts`).
- Health endpoint: `GET /health` via `src/routes/health.ts` (`healthHandler`).
- Env config: `src/config/env.ts` loads `.env`; no secrets in code. Defaults in `.env.example`.

## Project structure (expected)
- `src/config` — environment/configuration helpers
- `src/routes` — route registrations and handlers
- `src/controllers` — request orchestration (add when endpoints grow)
- `src/services` — business logic
- `src/models` / `src/repositories` — data layer abstractions
- `src/middlewares` — Express middlewares (errors, auth, rate limiting, etc.)
- `src/utils` — shared helpers (keep focused)
- `src/validators` — input validation/schemas
- `src/integrations` — external service clients
- `src/jobs` — background/cron jobs
- `src/tests` — automated tests (Vitest)

## Coding standards
- Keep modules cohesive and layered; avoid “god files”.
- Use async/await; validate and sanitize all external inputs.
- Centralize error handling; never leak stack traces or secrets to clients.
- TypeScript strict mode; prefer explicit return types on exported functions where clarity is needed.
- No dynamic `eval`/unsafe requires; avoid inline raw DB queries (use safe abstractions when added).

## Tooling & commands
- Lint/format: `npm run lint`, `npm run lint:fix`, `npm run format`.
- Tests: `npm test` (Vitest); add unit/integration coverage with new features.
- Build: `npm run build`; runtime: `npm run dev` (ts-node-dev) / `npm run start` (compiled).
- Hooks: Husky pre-commit runs lint-staged (`eslint --fix` for TS, `prettier --write` for JS/TS/JSON/MD`).

## Collaboration expectations
- Keep docs updated (`./README.md`, `./CONTRIBUTING.md`, and this directory's references). Log TODOs/tech debt when deferring.
- When adding features: include tests, update `.env.example` if new env vars are required, and document endpoints/flows.
- Respect `.cursorrules` and security guidelines (no secrets, validation required, rate limit sensitive paths when introduced).
