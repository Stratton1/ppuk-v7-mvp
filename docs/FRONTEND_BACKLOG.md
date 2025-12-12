# Frontend Backlog (Phase 0 Output)

Prioritised work items for Phase 1+ (frontend only, no /supabase changes).

## High Priority
1) Fix `/api/test/seed` build/runtime blocker: replace unsupported `supabase.auth.admin.getUserByEmail` with supported admin calls; keep behaviour identical.
2) Verify/implement frontend guardrails for missing admin RPCs (analytics/audit/users/dashboard) and add mock/stub fallbacks where needed (front-end only stubbing OK; do not change SQL).
3) Stabilise server/client boundaries: ensure all interactive tabs/forms/dialogs are client; keep data-fetch/render server-side; audit `components/layout/*` vs `components/app/*` to remove duplicates.
4) Remove dead/duplicate components/layouts from v6 era; align imports to canonical components.
5) Performance pass on compare page: batch doc/media counts (front-end batching or consolidated selects) to avoid sequential per-property queries.
6) Add Playwright coverage (mock mode) for admin pages, public passport, marketing, compare restricted rows, and watchlist empty state using the new testids.

## Medium Priority
7) Design consistency: add tokens (`/styles/tokens.ts`), standardise spacing/typography, tidy dashboard/cards/badges, improve empty states.
8) Server action hardening: ensure Zod on all inputs, consistent error return shape, safe session/param checks, reusable error helpers; document in SERVER_ACTION_STANDARDS.md.
9) Testing: Vitest unit tests for zod schemas/actions/components; Playwright suites; CI pipeline for `npm run check`.
10) DX/docs: update README, architecture guides, styleguide, contributor guide, VSCode settings, commands (`npm run check`).

## Low Priority
12) Public passport performance: consider caching/batching signed URLs if traffic grows.
13) UX copy for surveyor role: clarify viewer-by-default unless editor permission granted.
14) Maintain docs (`PPUK_V7_PLATFORM_INVENTORY.md`, audit, structure guide, mocks guide, design system, server action standards, integration report) as phases progress.
