# FRONTEND STRUCTURE GUIDE (Phase 1)

This guide defines the canonical structure for the frontend (Next.js App Router) and highlights legacy/dead areas to clean up. Scope: frontend only; do not change `/supabase` or backend.

## Layouts & Route Groups
- Root layout: `app/layout.tsx` (global HTML, Providers).
- Public layout: `app/(public)/layout.tsx` (marketing/auth shell).
- App layout: `app/(app)/layout.tsx` (authenticated shell via `AppShell`).
- Admin layout: `app/(app)/admin/layout.tsx` (admin guard + nav).
- Dev layout: `app/(app)/dev/layout.tsx` (developer tools header).
- Property nested layout: `app/(app)/properties/[id]/layout.tsx` (computes allowed tabs, renders `PropertyHeader` + `PropertyTabs`).

## Canonical Pages (high level)
- Auth: `(public)/auth/{login,register,forgot-password,reset-password}` + `test/login` for E2E. (Legacy `app/auth/login` should be retired.)
- Dashboard: `(app)/dashboard` (+ profile, security, settings).
- Properties: list, create, detail tabs (overview/details/documents/media/issues/history/edit), compare, watchlist.
- Admin: dashboard, analytics, audit, users (RPCs may be missing; UI guarded).
- Dev: index, components gallery, test-data, test-users, demo-flows.
- Search: `(public)/search` (server search + client filters/results).
- Public passport: `(public)/p/[slug]` (public visibility + signed URLs).
- Marketing: `(public)/page.tsx` sections (Hero, Stats, HowItWorks, Why Passports, Before/After, Personas, FAQ, CTA, LogoCloud).

## Component Layers
- **UI primitives**: `components/ui/*` (shadcn-based). Keep as single source for buttons, cards, inputs, tabs, dialog, badge, skeleton, icon, toast, label, textarea.
- **App shell**: `components/app/*` (AppShell, Sidebar, PageHeader, Section, KPI, AccessUnavailable, TasksList, SettingsForm, DevRoleBanner, InvitationsList, AppAvatar).
- **Dashboard**: `components/dashboard/*` (DashboardTabs, kpi/property/access/activity cards, recent activity, timeline helper).
- **Property domain**: `components/property/*` (header, tabs, overview/meta/key-facts, docs/media/issues/tasks/timeline/stakeholders/access, upload/delete dialogs, facts cards, watchlist button, gallery).
- **Issues**: `components/issues/*` (list/card/timeline/badge/create form).
- **Documents/Media**: `components/documents/*`, `components/media/*` (upload/list/grid/cards).
- **Events**: `components/events/*` (timeline, comments).
- **Search**: `components/search/*` (filters/results/global search/saved searches).
- **Auth**: `components/auth/LoginForm`.
- **Public passport**: `components/public-passport/*` (hero, metadata, gallery, documents).
- **Marketing**: `components/home/*` (Hero, StatsStrip, HowItWorks, Why Passports, BeforeAfter, ProductPreview, Personas, FAQ, CTA, LogoCloud, PageWrapper helpers).
- **Admin**: `components/admin/AdminRouteGuard`.

## Legacy / To Deprecate
- `components/layout/*` (app-shell, navbar, sidebar, topbar, footer, global-search) are legacy and unused; plan to remove or replace references with `components/app/*` counterparts.
- `components/app/PropertyLayout.tsx` is unused; prefer the route-level layout `app/(app)/properties/[id]/layout.tsx`.
- Duplicate login route `app/auth/login/page.tsx` should be removed in favor of `(public)/auth/login`.
- Placeholder `app/(app)/tasks/page.tsx` should gain real data or be clearly marked as coming soon.

## Server vs Client Boundaries (rules)
- Server components/pages for data fetching and SSR rendering; client components only for interactivity (forms, dialogs, tabs, local state, saved-search localStorage, mock mode toggles).
- Keep server props serialized as primitives; avoid passing Date/Map/Set/Functions to client components.
- Dynamic import used for `DashboardTabs` to avoid hydration mismatch—continue this pattern for heavy client-only widgets.

## Server Actions (frontend contract)
- Live under `frontend/actions/*`; pattern: `'use server'`, Zod validation, `getServerUser`, RPC permission checks (`can_edit_property`, etc.), safe returns `{ success, error?, data? }`, `revalidatePath` on mutation.
- Do not change backend RPC shapes; wrap or mock on the frontend if needed.

## Loading/Error/Empty States
- Ensure each route/tab has loading/error/empty where appropriate. Many components already have empty states; admin/public/compare/watchlist have testids for empty states. Standardize messaging in later phases.

## Performance Notes
- Compare page currently counts documents/media sequentially per property; plan to batch/aggregate in Phase 1–2.
- Signed URL caching exists; keep using `signed-url-cache`. Public passport signs per request—acceptable now; consider batching if traffic grows.

## Testing & Dev Tooling (frontend-facing)
- Dev/test endpoints: `/api/test/reset`, `/api/test/seed` (seed currently fails on admin API), `/dev/test-users`, `/test/login`, `/dev/test-data`, `/dev/components`.
- `data-testid` coverage is broad (admin, compare, watchlist empty, marketing/public passport, dashboards, forms). Use these for Playwright in Phase 5.

## Immediate Cleanup Targets (safe, small, front-end only)
- Remove/retire duplicate login route (`app/auth/login/page.tsx`) after confirming no references.
- Remove legacy `components/layout/*` and unused `components/app/PropertyLayout.tsx` once confirmed unused across codebase.
- Keep admin RPC calls UI-guarded; add frontend stubs/mocks in Phase 2 if backend remains absent.
