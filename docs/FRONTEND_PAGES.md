# Property Passport UK — Frontend Pages Overview

## 1. Layouts
- `frontend/app/layout.tsx` — Root layout applying global styles and providers (Supabase/Query via `app/providers.tsx`) and shell chrome.

## 2. Top-Level Routes
- `/` — `frontend/app/page.tsx` — PUBLIC — Marketing/landing page with product overview.
- `/auth/login` — `frontend/app/auth/login/page.tsx` — PUBLIC — Login form using server action.
- `/auth/register` — `frontend/app/auth/register/page.tsx` — PUBLIC — Registration form using server action.
- `/dashboard` — `frontend/app/dashboard/page.tsx` (+ `loading.tsx`, `error.tsx`) — AUTH-GUARDED — Shows KPIs, owned/shared properties, recent activity, access cards.
- `/properties` — `frontend/app/properties/page.tsx` (+ `loading.tsx`, `error.tsx`) — PUBLIC — Lists active properties with featured media.
- `/properties/create` — `frontend/app/properties/create/page.tsx` (+ `loading.tsx`, `error.tsx`) — AUTH-GUARDED — Create property form assigning owner.
- `/properties/[id]` — `frontend/app/properties/[id]/page.tsx` (+ `loading.tsx`, `error.tsx`, `not-found.tsx`) — AUTH-GUARDED — Passport overview: header, meta, gallery, documents, events, flags (placeholder), tasks, access sidebar.
- `/properties/[id]/edit` — `frontend/app/properties/[id]/edit/page.tsx` — AUTH-GUARDED — Edit property form.
- `/p/[slug]` — `frontend/app/p/[slug]/page.tsx` — PUBLIC — Public passport view (hero, metadata, gallery, public documents) via RPC.
- `/search` — `frontend/app/search/page.tsx` — PUBLIC — Search properties via RPC with query param.
- `/tasks` — `frontend/app/tasks/page.tsx` — AUTH-GUARDED (intended) — Placeholder pointing users to property-level tasks.
- `/invitations` — `frontend/app/invitations/page.tsx` — AUTH-GUARDED (intended) — Placeholder list (empty) with navigation CTAs.
- `/settings` — `frontend/app/settings/page.tsx` — AUTH-GUARDED — Profile settings stub (form disabled).
- API routes:
  - `/api/me` — `frontend/app/api/me/route.ts` — AUTH-GUARDED — Returns server user session JSON.
  - `/api/property-access/[propertyId]` — `frontend/app/api/property-access/[propertyId]/route.ts` — AUTH-GUARDED — Checks view access for a property.

## 3. Property-Specific Pages
- List: `/properties` — `frontend/app/properties/page.tsx` — PUBLIC.
- Create: `/properties/create` — `frontend/app/properties/create/page.tsx` — AUTH-GUARDED.
- Detail: `/properties/[id]` — `frontend/app/properties/[id]/page.tsx` — AUTH-GUARDED; aggregates meta, gallery, documents, events, flags (placeholder), tasks, access.
- Edit: `/properties/[id]/edit` — `frontend/app/properties/[id]/edit/page.tsx` — AUTH-GUARDED.
- Public slug: `/p/[slug]` — `frontend/app/p/[slug]/page.tsx` — PUBLIC.
- Boundaries: `loading.tsx`, `error.tsx`, `not-found.tsx` under relevant property routes.

## 4. Auth Pages
- Login: `/auth/login` — `frontend/app/auth/login/page.tsx`.
- Register: `/auth/register` — `frontend/app/auth/register/page.tsx`.
- No dedicated forgot/reset password page present.

## 5. Error / Loading Boundaries
- `/dashboard`: `frontend/app/dashboard/loading.tsx`, `.../error.tsx`.
- `/properties`: `frontend/app/properties/loading.tsx`, `.../error.tsx`.
- `/properties/create`: `frontend/app/properties/create/loading.tsx`, `.../error.tsx`.
- `/properties/[id]`: `frontend/app/properties/[id]/loading.tsx`, `.../error.tsx`, `.../not-found.tsx`.

## 6. Known Gaps / TODOs
- No dedicated subroutes for property timeline/documents/media/stakeholders/invite/settings; all combined in `/properties/[id]`.
- `/tasks`, `/invitations`, `/settings` are placeholders or stubs (no real data mutations).
- Flags component is a placeholder (v7 removed `property_flags`).
- No forgot/reset password flow.
- Some public pages use anon Supabase client; access gating relies on middleware/proxy outside page definitions.
