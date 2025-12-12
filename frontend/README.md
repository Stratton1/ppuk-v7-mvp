# Property Passport UK v7 — Frontend

Next.js 16 (App Router, RSC-first) + Supabase auth/RLS, Tailwind + shadcn UI.

## Stack
- Next.js 16 with server components by default; client components only for interactivity.
- Supabase auth + RLS; mutations flow through server actions in `frontend/actions/*`.
- Tailwind + shadcn UI; design tokens in `styles/tokens.ts`.
- React Query for interactive widgets; data-testid coverage for Playwright.

## Setup
- Node 20+
- Install: `npm ci`
- Env (minimum):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Run dev: `npm run dev`

## Testing
- Unit: `npm run test:unit` (Vitest, pure helpers)
- Integration: `npm run test:integration`
- RLS: `npm run test:rls` (requires Supabase test env vars)
- Coverage: `npm run test:coverage`
- Playwright E2E: `npm run test:e2e` (uses `/api/test/reset` and data-testid hooks)

## DX & References
- Server actions: `docs/SERVER_ACTION_STANDARDS.md`
- Design system: `docs/DESIGN_SYSTEM.md`
- Structure & architecture: `docs/FRONTEND_STRUCTURE_GUIDE.md` and `docs/FRONTEND_ARCHITECTURE.md`
-- Mock mode: (deprecated) `docs/MOCKS_GUIDE.md`

Follow the rules in `/docs/engineering` (RLS, server actions, design system, domain language). Avoid schema changes from the frontend. Use `data-testid` for any new interactive elements to keep Playwright coverage intact.
