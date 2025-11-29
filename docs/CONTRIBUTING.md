# Contributing

Thanks for contributing to the Property Passport UK platform. This repo uses TypeScript, Express, and strict linting/testing. Please follow the guidance below to keep quality high and consistent.

## Ground rules
- Work only under `src/` for application code; keep modules cohesive (config, routes, controllers, services, middlewares, utils, validators, integrations, jobs, tests).
- No secrets or credentials in code or config — use environment variables and update `.env.example` when adding new required values.
- Validate and sanitize external inputs; never expose stack traces to clients.
- Favor small, focused changes; avoid “god files”.

## Coding standards
- TypeScript strict mode; prefer explicit types where clarity helps.
- Use async/await for async flows; avoid callbacks.
- Keep error handling centralized via middlewares and domain errors.
- Follow lint/format rules (`eslint` + `prettier`); run `npm run lint` and `npm run format` as needed.
- Tests: add/maintain unit/integration tests alongside features; `npm test` must pass.

## Commit and PR guidelines
- Commit messages: concise, imperative (e.g., "Add health endpoint", "Fix lint config"). Conventional Commit style is welcome but not required.
- Keep commits logically grouped; avoid mixing unrelated changes.
- Before opening a PR: ensure `npm run lint`, `npm test`, and `npm run build` succeed; update docs when behavior/config changes.
- PRs should describe scope, testing performed, and any follow-up work or risks.

## Tooling
- Husky runs lint-staged on pre-commit to auto-lint/format staged files.
- Preferred scripts:
  - `npm run dev` — local development
  - `npm run lint` / `npm run lint:fix` — linting
  - `npm run format` — formatting
  - `npm test` — automated tests
  - `npm run build` — TypeScript build

## Getting started
1. Install Node 18+ (see `.nvmrc`).
2. `npm install`
3. Copy `.env.example` to `.env` and configure.
4. `npm run dev` to start the server; hit `/health` to verify.
5. Make changes with tests and linting; commit when clean.

## Documentation
- Update `./README.md` for user-facing changes and quick start adjustments.
- Keep `docs/` architecture and process docs current (e.g., `core.md`, blueprints, refresh notes).
- Record known gaps or TODOs in code or a backlog doc when deferring work.
