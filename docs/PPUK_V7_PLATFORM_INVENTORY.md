# Property Passport UK v7 — Platform Inventory & Architecture Manual

This document consolidates the full inventory produced from tasks 1–7: route tree, components, domain modules, testability, role flows, entity relationships, and recommendations. It is structured for engineers, auditors, designers, and stakeholders to understand the platform quickly.

---

## 1) Route Tree & Server/Client Classification

- **Global layouts**
  - `frontend/app/layout.tsx` — Server. Root HTML shell with `Providers`.
  - `frontend/app/(public)/layout.tsx` — Client. Marketing/auth shell.
  - `frontend/app/(app)/layout.tsx` — Server. Authenticated shell via `AppShell`.
  - `frontend/app/(app)/admin/layout.tsx` — Server. Admin guard (`AdminRouteGuard`) + tabs.
  - `frontend/app/(app)/dev/layout.tsx` — Server. Developer tools header.

- **Public & auth**
  - `/` → `(public)/page.tsx` — Server. Marketing sections only.
  - `/auth/login` → `app/auth/login/page.tsx` — Server. Redirects if authed; renders `LoginForm` (client).
  - `/auth/register` → `(public)/auth/register/page.tsx` — Server + `register-form.tsx` (client).
  - `/auth/forgot-password` → `(public)/auth/forgot-password/page.tsx` — Server + `forgot-password-form.tsx` (client).
  - `/auth/reset-password` → `(public)/auth/reset-password/page.tsx` — Server + `reset-password-form.tsx` (client).
  - `/test/login` → `(public)/test/login/page.tsx` — Client. Test users panel (env/query gated).
  - `/search` → `(public)/search/page.tsx` — Server. Calls `runSearch`; renders `SearchFilters`, `SearchResults`, `SavedSearchList`, `SaveCurrentSearch` (clients).
  - `/p/[slug]` → `(public)/p/[slug]/page.tsx` — Server. Public passport; Supabase selects property/media/documents; signed URLs.

- **Authenticated app `(app)`**
  - `/dashboard` → `(app)/dashboard/page.tsx` — Server. Fetches properties, stakeholders, documents/media, flags, events, completions; renders `DashboardTabsClient` (client) → `DashboardTabs` (client).
  - `/dashboard/profile` — Server + `profile-form.tsx` (client) → `updateProfileAction`.
  - `/dashboard/security` — Server + `security-form.tsx` (client) → `updatePasswordAction`.
  - `/settings` — Server + `components/app/SettingsForm.tsx` (client) → `actions/update-profile`.
  - `/invitations` — Server placeholder (uses `InvitationsList`).
  - `/tasks` — Server placeholder.
  - `/watchlist` — Server. Fetches watchlist + media; renders `PropertyCard`.
  - `/properties` — Server. Renders `PropertyList`.
  - `/properties/create` — Server. Checks `canCreateProperty`; renders `CreatePropertyForm` (client) or `AccessUnavailable`.
  - `/properties/[id]/layout.tsx` — Server. Fetch property + featured media; allowed tabs computed via role helpers; renders `PropertyTabs` (client).
  - `/properties/[id]` — Server. Overview; previews docs/media; related properties; tasks/flags/timeline sections.
  - `/properties/[id]/details` — Server. Key facts, meta, metadata table.
  - `/properties/[id]/documents` — Server. Lists docs; `DocumentUploadForm` (client) if permitted; delete via server action; `TimelineList`.
  - `/properties/[id]/media` — Server. `MediaUploadForm` (client) if permitted; `MediaGrid`; media events.
  - `/properties/[id]/issues` — Server. Issues list; `IssueCreateForm` (client) if permitted; comments (`CommentForm` client); timelines.
  - `/properties/[id]/history` — Server. Timeline list of events.
  - `/properties/[id]/edit` — Server. `PropertyEditForm` (client) or `AccessUnavailable`.
  - `/properties/compare` — Server. Auth required; uses RPC `can_view_property`; CSV export.

- **Developer tools**
  - `/dev` — Server. Links to tools.
  - `/dev/components` — Client. UI showcase.
  - `/dev/test-data` — Server + `test-data-controls.tsx` (client) hitting `/api/test/reset|seed`.
  - `/dev/test-users` — Client. Supabase auth panel with seeded users.
  - `/dev/demo-flows` — Server. Scripted role flows.

- **Admin**
  - `/admin` — Server. Uses RPC `get_admin_dashboard_stats` (may be missing).
  - `/admin/analytics` — Server. RPCs: `get_properties_over_time`, `get_user_growth`, `get_document_uploads_over_time`, `get_api_usage_by_provider` (may be missing).
  - `/admin/audit` — Server. RPC `get_audit_logs` (may be missing).
  - `/admin/users` — Server. RPC `get_admin_users` (may be missing).

- **API routes**
  - `/api/test/reset` — Route handler; service-role client; truncates and seeds demo data.
  - `/api/test/seed` — Present (not detailed).
  - `/api/search/*` — Present (not detailed).

### Boundary notes
- RSC by default; client components only for interactive forms, dialogs, tabs, saved-search storage.
- `DashboardTabs` is dynamically imported with `ssr: false` to avoid hydration issues.
- Permissions enforced via Supabase RPCs (`can_edit_property`, `can_view_property`) and helpers (`role-utils`, `permissions/documents`).

---

## 2) Components & Usages (by area)

### components/ui (client primitives)
`button`, `input`, `textarea`, `label`, `badge`, `card`, `dialog`, `tabs`, `skeleton`, `icon`, `use-toast`. Used across forms/pages; testing via consumer-provided testids.

### components/app
- Layout/shell: `AppShell` (server), `AppShellSidebar` (client nav `nav-*` testids), `AppPageHeader`, `AppSection`, `DevRoleBanner`, `AppAvatar`, `AppKPI`.
- Access: `AccessUnavailable` (server card).
- Lists: `InvitationsList` (placeholder), `TasksList`.
- Forms: `SettingsForm` (client) → `actions/update-profile`.

### components/dashboard
- `DashboardTabs` (client) + `getDashboardConfig` (server) for role-based panels.
- Cards: `kpi-card`, `property-card` (edit button testid), `access-card`, `recent-activity`, `activity-timeline`.

### components/property (mixed)
- Client forms/dialogs: `CreatePropertyForm`, `PropertyEditForm`, `PropertyTabs`, `tasks/create-task-dialog`, `timeline/event-create-dialog`, `upload-document-dialog`, `upload-photo-dialog`, `watchlist-button`, delete dialogs, invite dialogs.
- Server sections/cards: `PropertyHeader`, `PropertyOverviewCard`, `PropertyKeyFacts`, `PropertyMetaSection`, `PropertyDocumentsSection`, `PropertyTasksSection`, `PropertyFlagsSection`, `PropertyStakeholdersSection`, `PropertyTimelineSection`, `PropertyEvents`, `property-list`, `property-card`, `property-gallery`, `timeline/event-list`, `timeline/event-card`.
- Facts cards: `cards/epc-card`, `epc-card-integrated`, `flood-card`, `flood-card-integrated`, `planning-card`, `title-card`, `title-card-integrated`, `crime-card`.

### components/issues
`IssueCreateForm` (client), `IssueList`, `IssueCard`, `IssueTimeline`, `IssueBadge`.

### components/documents
`DocumentUploadForm` (client), `DocumentCard`, `DocumentList`.

### components/media
`MediaUploadForm` (client), `MediaGrid`.

### components/events
`CommentForm` (client), `CommentList`, `TimelineList`.

### components/search
`SearchFilters`, `SearchResults`, `SavedSearchList`, `GlobalSearchBar` (all client), `SaveCurrentSearch` client in route folder.

### components/admin
`AdminRouteGuard` (server).

### components/home/public-passport
Marketing/public components (`HeroSection`, `PublicHero`, `PublicMetadata`, `PublicGallery`, `PublicDocuments`, etc.) used on `/` and `/p/[slug]`.

---

## 3) Domain Modules & Helpers
- **Roles/permissions**
  - `lib/roles/domain.ts`: `DashboardRole`, UI gating (`canViewDocumentsUI`, `canViewMediaUI`, `canViewIssuesUI`, `canSeeAdminPanel`), labels/icons, default dashboard tabs.
  - `lib/role-utils.ts`: property-level auth (`isAdmin/Owner/Buyer/Tenant/Editor/Viewer`), `canEditProperty`, `canViewProperty`, `canUploadDocument/Media`, `canInvite`, badge colors, expiry status, role sorting.
  - `lib/permissions/documents.ts`: `canUploadDocuments`, `canEditDocuments`, `canUploadMedia` (RPC `can_edit_property`).

- **Issues**
  - `lib/issues/types.ts`: Severity/Status/Category enums, `ISSUE_CATEGORIES`, mappers `flagRowToIssue`, `mapSeverity`, `mapStatus`, `mapCategory`, `buildDefaultIssueEvents`.

- **Documents**
  - `lib/documents/types.ts`: `DocumentCategoryId`, `DOCUMENT_CATEGORIES`, `UidDocument`, `docRowToUidDocument` (signed URL; bucket `property-documents`), `mapDocumentTypeToCategory`.
  - `lib/document-utils.ts`: labels/icons/descriptions, mime and size formatting, status badge helper.

- **Media**
  - `lib/media/types.ts`: `MediaCategoryId`, `UidMedia`, `mediaRowToUidMedia` (signed URL; bucket `property-photos`), `mapMediaTypeToCategory`.

- **Events/Timeline**
  - `lib/events/types.ts`: `EventType`, `TimelineEntry`, mappers (`flagToEvents`, `documentToEvents`, `mediaToEvents`, `issueToEvents`, `propertyToEvents`, `eventRowToEntry`).

- **Search**
  - `lib/search/types.ts`: `FilterSet`, `SearchQuery`, `SearchResult`, `propertyRowToSearchResult`.
  - `lib/search/engine.ts`: server search; RPC `search_properties` or `properties` select; UI-side filters; buyer visibility filter.
  - `lib/search/saved.ts`: client localStorage save/delete.

- **Auth**
  - `lib/auth/server-user.ts`: builds `ServerUserSession` with `property_roles` from `property_stakeholders` + owned properties, `isAdmin`.
  - `lib/auth/actions.ts`: login/register/logout/forgot/reset/update password/profile (server actions, Supabase auth).
  - `lib/auth/middleware-helpers.ts`: classify public/protected/admin/property routes.

- **Property utils**
  - `lib/property-utils.ts`: server `canEditProperty` (auth + RPC).
  - `lib/property-facts.ts`: stub EPC/Flood/Planning/Title data for UI cards.

- **Supabase / signed URLs / env**
  - `lib/supabase/server.ts`, `lib/supabase/client.ts`.
  - `lib/signed-url.ts` + `lib/signed-url-cache.ts` (batch signing, cache).
  - `lib/env.ts`: required env validation, .env.test.local support.

---

## 4) data-testid Usage & Testability

- **Strong coverage**
  - Dashboard: `dashboard-root`, `dashboard-loaded`, `dashboard-tab-*`, `tab-panel-*`, `action-add-property`, recommended/property/issue/doc/media widgets.
  - Dev tools: `dev-index-root`, `dev-link-*`, `dev-test-data-page`, `dev-test-reset-button`, `dev-test-seed-button`, `dev-test-status`, `dev-components-root`, `category-*`, `dev-demo-flows-page`, flow IDs, `dev-test-users-root`, per-user testids.
  - Auth: `login-form`, `login-email/password/submit`, `register-submit`, `forgot-password-*`, `reset-password-*`.
  - Search: `search-page-input`, `filter-*`, `search-result-card-*`, `global-search-*`, `saved-search-*`.
  - Property: `tab-*`, `property-loaded`, `property-details-loaded`, `property-history-page`, `property-issues-page`, `property-documents-page`, `property-media-loaded`, `property-metadata-table`, overview key-doc/media/related sections, `timeline-list`, `timeline-event`.
  - Forms/dialogs: property edit/create (`property-edit-*`), doc upload (`doc-upload-*`), doc delete (`doc-delete-button-*`), media upload (`media-upload-form`), issues (`issue-create-form`, `issue-timeline`), comments (`comment-entry-*`, custom submit/input IDs), invites (`invite-*`), tasks (`task-*`), events (`event-*`), facts cards (`keyfacts-*`, `epc-card`, `flood-card`, `title-card`, `planning-card`, `crime-card`), media items (`media-item-*`), doc cards (`doc-card-*`), `access-unavailable`.

- **Gaps / add testids**
  - Admin pages (`/admin`, `/admin/analytics`, `/admin/audit`, `/admin/users`).
  - Compare page table and rows.
  - Watchlist empty state wrapper.
  - Public marketing components and public passport components.

- **Playwright guidance**
  - Use `/api/test/reset` before suites; `/test/login` or `/dev/test-users` for deterministic roles.
  - Cover: auth flows; dashboard tabs per role; search filters/saved search; property tabs (overview/details/docs/media/issues/history); doc/media upload/delete; issue create/comment; property edit & public visibility; watchlist; admin pages; dev tools.

---

## 5) Role-Based Flows & Permissions

- **Role derivation**
  - Session via `getServerUser`: `primary_role`, `property_roles` (status + permission), `isAdmin`.
  - UI gating with `DashboardRole` helpers: tabs include/exclude documents/media/issues; `PropertyTabs` allowedTabs computed in layout; `canViewDocumentsUI`, `canViewMediaUI`, `canViewIssuesUI`.

- **Permissions**
  - Supabase RPCs: `can_edit_property` for edits/uploads/deletes; `can_view_property` for compare/access.
  - Admin bypasses most checks.
  - `canCreateProperty`: admin, agent, conveyancer, or any user who already owns a property; buyers/consumers blocked.
  - Invites: owners/admin via `canInvite` (ensure dialog aligns).
  - Upload/delete docs/media: editors/owners/admin.

- **Flows by role**
  - Owner: create/edit property; upload docs/media; issues; invites; all tabs; watchlist; compare.
  - Agent: similar to owner for edit/upload; can create; full tabs.
  - Conveyancer: same tab access as agent; can create; edit/upload if RPC allows.
  - Buyer (consumer): cannot create; tabs exclude docs/media; can view issues; view limited by `can_view_property`.
  - Tenant: treated as viewer (status).
  - Admin: full access + admin suite; can edit any property.
  - Surveyor: present in enums/test users; defaults to consumer unless granted roles (clarify expectations).

- **Guards**
  - `AdminRouteGuard` redirects non-admin to dashboard; unauth to login with redirect.
  - Pages like dashboard/watchlist/profile/security redirect unauth to login.
  - Public passport requires `public_visibility`.

---

## 6) Property Entities & Relationships

- **Property (`properties`)**
  - Fields: `id`, `display_address`, `uprn`, `public_slug`, `public_visibility`, `status`, `created_by_user_id`, lat/lng, timestamps, soft-delete.
  - UI: overview, key facts, meta, compare, dashboard, watchlist, public passport.
  - Mutations: `createPropertyAction`, `updatePropertyAction`, public visibility toggle.

- **Stakeholders (`property_stakeholders`)**
  - Fields: `property_id`, `user_id`, `role`, `status` (owner/buyer/tenant), `permission` (editor/viewer), `expires_at`, `granted_by_user_id`, soft-delete.
  - UI: `PropertyStakeholdersSection`, badges, invite/remove dialogs; feeds session `property_roles`.

- **Invitations (`invitations`)**
  - Fields: token, email, property_id, role, status, expires_at, permission/status.
  - UI: invite dialog; `InvitationsList` placeholder.

- **Documents (`documents`, `document_versions`)**
  - Fields: storage bucket/path, `document_type`, `title`, `mime_type`, `size_bytes`, `uploaded_by_user_id`, `status`, version, soft-delete.
  - UI: documents tab, overview preview, dashboard widgets, public passport (active docs), compare counts.
  - Mutations: `createDocumentAction`, `deleteDocumentAction`, `updateDocumentCategoryAction`; storage bucket `property-documents`; signed URLs.

- **Media (`media`)**
  - Fields: storage bucket/path, `media_type`, `mime_type`, `size_bytes`, `uploaded_by_user_id`, `status`, soft-delete.
  - UI: media tab/grid, overview preview, dashboard widgets, public passport gallery, compare counts.
  - Mutations: `uploadMediaAction`, delete actions; bucket `property-photos`; signed URLs.

- **Flags/Issues (`property_flags` mapped to Issue)**
  - Fields (inferred): `id`, `property_id`, `flag_type`, `severity`, `status`, `description`, `created_at`, `updated_at`, `created_by_user_id`, `resolved_at`, `resolved_by_user_id`.
  - UI: Issues tab (open/resolved), issue cards/timeline/comments; dashboard issues widget.
  - Mutations: `createIssueAction`; comments via `createCommentAction`.

- **Tasks (`tasks`)**
  - Fields: `id`, `property_id`, `description`, `priority`, `due_date`, `assigned_to_user_id`, soft-delete.
  - UI: property tasks section, task dialog/list, dashboard tasks widget.

- **Events (`property_events`)**
  - Fields: `id`, `property_id`, `event_type`, `event_payload`, `actor_user_id`, timestamps.
  - UI: timeline sections, history tab, dashboard activity, document/media event filters.

- **Metadata (`property_metadata`)**
  - Fields: `meta_key`, `meta_value` JSON, timestamps.
  - UI: metadata table in details.

- **Watchlist (`watchlist`)**
  - Fields: `id`, `property_id`, `user_id`, `created_at`.
  - UI: watchlist page, watchlist button.

- **Cross-links**
  - Docs/Media/Flags generate timeline entries via `lib/events/types`.
  - Stakeholders/invitations determine `property_roles` → UI tabs, uploads, edits.
  - Compare page aggregates completions (RPC), doc/media counts, featured media.

---

## 7) Findings, Risks, Recommendations

- **RPC existence/guardrails**
  - Admin pages reference RPCs (`get_admin_dashboard_stats`, `get_properties_over_time`, `get_user_growth`, `get_document_uploads_over_time`, `get_api_usage_by_provider`, `get_audit_logs`, `get_admin_users`) that may not exist. Add fallbacks, feature flags, or implement stubs to avoid runtime errors; add testids to admin pages for E2E.

- **Testability gaps**
  - Add testids to admin pages, compare table, watchlist empty state, public marketing/public passport components.

- **Permissions consistency**
  - Ensure invite dialog/action aligns with `canInvite` (owner/admin). Clarify surveyor role expectations; currently behaves like consumer unless given property roles.

- **Performance/duplication**
  - Compare page counts (docs/media) fetched sequentially; batch where possible. Reuse loaders for property+media/docs across pages to reduce duplication.

- **Hydration/CSR boundaries**
  - `DashboardTabs` already `ssr: false`; other client components isolated. Keep server-only data serialized as primitives; avoid passing Dates/Functions to clients.

- **Public passport**
  - Signed URLs generated per request; consider caching/batching (similar to dashboard) and confirm no private docs/media exposed (currently filters by `public_visibility` and status).

- **Dev/test tooling**
  - `/api/test/reset` provides clean state; ensure Playwright suites call it. `/test/login` and `/dev/test-users` enable deterministic roles.

---

## Quick Reference: Server Actions (mutations)

- Properties: `createPropertyAction`, `updatePropertyAction` (zod validation, `can_edit_property`, `revalidatePath`), `canCreateProperty`.
- Documents: `createDocumentAction`, `deleteDocumentAction`, `updateDocumentCategoryAction` (storage + DB, `can_edit_property`).
- Media: `uploadMediaAction`, delete actions (storage + DB, `can_edit_property`).
- Issues: `createIssueAction`; comments via `createCommentAction`.
- Events: `getEventsForProperty`, `getCommentsFor`, `property-events` actions.
- Tasks: `property-tasks`/`tasks` actions (create/update/delete).
- Invitations/Roles: `property-invitations`, `grant-property-role`, `revoke-property-role`.
- Auth: login/register/logout/forgot/reset/update password/profile in `lib/auth/actions`.

---

## Quick Reference: Permissions Helpers & RPCs
- RPCs: `can_edit_property`, `can_view_property`, `search_properties` (plus admin RPCs noted above).
- Helpers: `role-utils` (isAdmin/Owner/Viewer/Editor; canEdit/View/Invite/Upload), `permissions/documents`, `roles/domain` (UI tab gating), `auth/middleware-helpers` (route classification).

---

## Suggested Next Actions
1) Add testids to admin pages, compare table, watchlist empty, public views.
2) Guard or implement missing admin RPCs; add graceful fallbacks.
3) Clarify surveyor role handling and UI gating.
4) Batch counts on compare page; share property loaders to cut duplicate queries.
5) Add invite permission checks consistent with `canInvite`.
6) Add minimal public E2E coverage with new testids (public passport, marketing CTA).

---

*Document maintained for PPUK v7 architecture alignment. Update alongside route/component/domain changes to keep inventory current.*
