# Property Passport UK Platform (v7) - Starter Scaffold

This repository is the starter TypeScript + Express scaffold for the Property Passport UK platform. It includes opinionated defaults for linting/formatting, environment management, and testing.

## Quick start

1) **Prerequisites:** Node 18+ (see `../.nvmrc`), npm.
2) **Install deps:** `npm install`
3) **Environment:** copy `../.env.example` to `.env` and adjust as needed.
4) **Run dev server:** `npm run dev` (ts-node-dev, reloads on change).
5) **Health check:** `GET http://localhost:3000/health` returns `{ "status": "ok" }`.

## Scripts

- `npm run dev` — start dev server (ts-node-dev) at configured port.
- `npm run build` — typecheck and emit compiled JS to `dist/`.
- `npm run start` — run compiled server from `dist/`.
- `npm run lint` / `npm run lint:fix` — ESLint with TypeScript + Prettier.
- `npm run format` / `npm run format:check` — Prettier formatting.
- `npm test` / `npm run test:watch` — Vitest suite.

## Project layout

- `src/` — application code
  - `config/` — environment/config loading
  - `middlewares/` — Express middlewares (error handling, etc.)
  - `routes/` — route handlers (e.g., `/health`)
  - `tests/` — automated tests (Vitest)
- `docs/` (this directory) — architectural and process documentation
- `.husky/` — git hooks (pre-commit runs lint-staged)

## Development standards

- TypeScript-first; keep code under `src/` only.
- Validate inputs and avoid leaking internals in errors.
- Keep modules cohesive and layered (config, routes, controllers, services, etc.).
- Lint and tests must pass before merging; hooks run lint-staged on commit.
- Never commit secrets — use environment variables and `.env.example` for defaults.

## Additional references

See this directory for deeper architecture notes (`core.md`, `PPUK_V7_COMPLETE_BLUEPRINT*.md`, `refresh.md`, etc.) and contributor guidance in `./CONTRIBUTING.md` and `./AGENTS.md`.
