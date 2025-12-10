# Testing Stability Notes

- **Stable selectors**: UI elements now include `data-testid` attributes (login form fields, dashboard, property pages, key facts cards, timeline/task controls, invites, settings, public passport). Prefer `page.getByTestId('<id>')` in Playwright to stay resilient to layout changes. Loaded markers (`dashboard-loaded`, `property-loaded`, `key-facts-loaded`) gate page readiness.
- **Deterministic reset**: `POST /api/test/reset` (only when `NODE_ENV=test` and an authenticated `@ppuk.test` user) clears property-related tables, then seeds a public demo property with slug `example-slug`. Playwright fixtures log in, call this route, clear cookies, and return to `/auth/login` before each test to ensure isolation.
- **Running tests**: Set Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and run:
  - `npm run test:e2e` (headless by config); `npm run test:e2e:headed` for visible runs.
  - `npm run demo` to drive `tests/e2e/demo-flow.spec.ts` with trace and video enabled.
  - Playwright starts `NODE_ENV=test npm run dev` via `webServer` in `playwright.config.ts`.
- **Recording demos**: Use `npm run demo` or `npx playwright test tests/e2e/demo-flow.spec.ts --headed --trace=on --video=on` for investor-friendly captures; artifacts land in `playwright-report` plus `screenshots/final-passport.png`.
- **Updating selectors**: When adding UI, attach `data-testid` to new interactive elements and, if needed, add a companion loaded marker. Keep tests on `getByTestId` instead of CSS/text selectors to avoid flakes.
