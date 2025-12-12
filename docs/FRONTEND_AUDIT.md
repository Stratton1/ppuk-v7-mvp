# Frontend Audit (Phase 0)

Scope: Read-only audit of `frontend/` for routes, components, actions, boundaries, and risks. No code changes were made.

## Routes & Layouts (App Router)
- Layouts: root (`app/layout.tsx`), public (`app/(public)/layout.tsx`), app shell (`app/(app)/layout.tsx`), admin (`app/(app)/admin/layout.tsx`), dev (`app/(app)/dev/layout.tsx`), property nested layout (`app/(app)/properties/[id]/layout.tsx`).
- Pages: dashboard, profile, security, settings, invitations, tasks (placeholder), watchlist, properties (list/create/detail/edit/tabs), compare, admin (dashboard/analytics/audit/users), dev tools (index/components/test-data/test-users/demo-flows), search, auth (login/register/forgot/reset, test-login), public passport `/p/[slug]`, marketing home.

## Components Overview
- UI primitives: `components/ui/*` (shadcn-based).
- App shell: `components/app/*` (PageHeader, Section, Shell, Sidebar, KPIs, AccessUnavailable, TasksList, SettingsForm, DevRoleBanner, InvitationsList).
- Dashboard: `components/dashboard/*` (DashboardTabs, property/access/kpi/activity cards, recent activity, getDashboardConfig helper).
- Property domain: rich set for overview/details/docs/media/issues/tasks/timeline/stakeholders/access/upload/delete dialogs, facts cards (EPC/Flood/Planning/Title/Crime), tabs, gallery, watchlist button.
- Issues: list/card/timeline/badge/create form.
- Documents: upload form, card, list.
- Media: upload form, grid.
- Events: comment form/list, timeline list.
- Search: filters/results/global search/saved searches.
- Auth: LoginForm.
- Public passport: public hero/metadata/gallery/documents.
- Marketing: Hero/StatsStrip/HowItWorks/WhyUKNeedsPassports/BeforeAfter/ProductPreview/Personas/FAQ/CTA/LogoCloud/PageWrapper.
- Admin: AdminRouteGuard.

## Server Actions & Helpers
- Actions under `frontend/actions/`: properties (create/update), documents (upload/delete/update category), media, issues, events/comments, property-tasks, property-invitations/roles, watchlist, set-public-visibility, upload-property-photo/document, update-profile, grant/revoke property role, etc.
- Auth actions: login/register/logout/forgot/reset/update password/profile.
- Helpers: `lib/roles/domain`, `lib/role-utils`, `lib/permissions/documents`, `lib/property-utils`, `lib/issues/types`, `lib/documents/types`, `lib/media/types`, `lib/events/types`, `lib/search/*`, `lib/signed-url*`, `lib/env`, `lib/auth/*`, `lib/property-facts` (mock facts).

## Strengths
- Clear server/client separation in most places; server components for data fetch, client for forms/dialogs/tabs.
- Server actions generally validate with Zod and call `getServerUser`, RPCs, and `revalidatePath`.
- Document/media handling uses signed URLs and buckets; caching helper exists.
- Public passport gated by `public_visibility` and uses signed URLs.
- Broad `data-testid` coverage (incl. admin, compare, watchlist, public marketing/passport).
- Dev/test tooling: `/api/test/reset`, `/api/test/seed` (failing currently), `/dev/test-users`, `/test/login`, `/dev/test-data`, component gallery.

## Issues / Risks Observed
- Build/runtime blocker: `/api/test/seed` uses `supabase.auth.admin.getUserByEmail` (not in SDK) → 500 and build failure.
- Admin RPCs referenced may not exist (analytics/audit/users/dashboard) → guarded in UI but backend missing; causes prior errors before guardrails.
- Compare page: sequential doc/media counts per property (performance); restricted properties are filtered but counts still sequential.
- Hydration/serialization: generally ok; `DashboardTabs` uses dynamic import to avoid SSR mismatch. Continue to keep server data as primitives for client.
- Placeholder/legacy: tasks page is placeholder; some layout components (e.g., components/layout/*) may be unused vs `components/app/*`.
- Dev/test endpoints exposed in dev; ensure env gating when in prod.

## Missing or Potential Gaps
- E2E coverage for admin/public/compare/watchlist empty state using new testids.
- Surveyor role defaults to viewer; ensure UX copy reflects limited permissions.
- Public passport signed URLs are generated per request; acceptable but could cache/batch if traffic grows.

## Next-Phase Focus (Front-End Only)
- Phase 1: Stabilise component/server-client boundaries, remove dead/duplicate layout code, align imports, and ensure all pages compile cleanly. Produce FRONTEND_STRUCTURE_GUIDE.md.
- Phase 2: Add mock layer/offline mode with env toggle and mock datasets; wrap actions for mock mode; add /dev/mock-users.
- Phase 3: Design consistency pass with tokens, spacing, empty states, and visual polish; produce DESIGN_SYSTEM.md.
- Phase 4: Harden server actions with Zod and consistent error handling; add SERVER_ACTION_STANDARDS.md.
- Phase 5: Add Playwright (mock mode) + Vitest for schemas/actions/components; CI pipeline.
- Phase 6: DX/docs improvements (README, styleguide, architecture, contributor guide, commands for check/mock).
- Phase 7: Integration validation with backend (no schema changes) and INTEGRATION_REPORT.md.
