---
name: PPUK v7.0 Phased Execution Roadmap
overview: Complete phased execution roadmap for Property Passport UK v7.0, covering hygiene/security, performance optimization, testing foundation, external API integrations, advanced user features, and admin/analytics tooling. Designed for 1-3 engineers over 8-12 weeks.
todos: []
---

# Property Passport UK v7.0 – Phased Execution Roadmap

**Version:** 1.0

**Date:** March 2025

**Author:** Senior PropTech Engineering Architect & Delivery Planner

**Status:** Implementation-Ready

---

## Executive Summary

Property Passport UK v7.0 is currently at **~70% MVP completion** with core features implemented: authentication, property CRUD, document/media management, role-based access control, dashboard, and public passport views. The codebase uses Next.js 16 App Router with Supabase backend, comprehensive RLS policies, and a modern role model (primary_role + per-property status/permission).

**Current State:**

- ✅ Core schema: properties, stakeholders, documents, media, tasks, events, invitations, notifications
- ✅ Frontend: Dashboard, property management, server actions, public passport
- ✅ Security: RLS policies, storage buckets, signed URLs
- ⚠️ Gaps: Performance (N+1 queries, no pagination, no FTS), external APIs (none), admin UI (none), test coverage (minimal)

**Target State:**

Production-ready PPUK v7.0 with optimized performance, external data integrations (EPC, HMLR, Flood, Crime), advanced user features (flags, watchlist, comparison, reports), and operational tooling (admin dashboard, analytics, audit viewer).

**Timeline:** 8-12 weeks for a small team (1-3 engineers) following this roadmap.

---

## Phase 1 – Hygiene, Security & Environment Sanity

### Goal & Definition of Done

Establish a clean, secure, reproducible development environment with no secrets in version control, proper build artifact exclusions, aligned package management, and storage policies that enforce property-scoped access. Success means: zero secrets committed, `.gitignore` comprehensive, storage policies property-scoped, seed data aligned with latest schema, and no build warnings.

**Definition of Done:**

- [ ] `.env.local` and all `.env*` files verified not tracked in git
- [ ] `.gitignore` excludes all build artifacts, test outputs, and env files
- [ ] Root `package.json` consolidated or clearly deprecated
- [ ] Next.js middleware deprecation warning resolved
- [ ] Storage bucket policies enforce property-scoped access
- [ ] `supabase/seed.sql` uses new role enums (status/permission)
- [ ] `npm run build` passes with no warnings
- [ ] Documentation updated with environment setup instructions

### Scope – In / Out

**In Scope:**

- `.gitignore` audit and updates
- Environment variable management (`.env.example`, `.env.test.local` template)
- Root vs `frontend/package.json` consolidation
- Next.js middleware migration to `proxy` pattern
- Storage bucket policy review and property-scoped updates
- Seed data alignment with `20250320000000_ppuk_v7_roles_status_permission.sql`
- Build configuration cleanup

**Out of Scope:**

- Business logic changes
- Database schema changes (except storage policies)
- Frontend feature additions
- Test writing (covered in Phase 3)

### Concrete Tasks / Work Items

#### Task 1.1: Audit and Secure Environment Files

**Files:** `.gitignore`, `.env.local` (if exists), `.env.example` (to create), `docs/ENVIRONMENT_SETUP.md` (to create)

**Difficulty:** S

**Risk:** Low

1. Verify `.env.local` is not tracked:
   ```bash
   git ls-files | grep -E '\.env'
   ```


If found, remove from git history using `git filter-repo` or BFG Repo-Cleaner.

2. Audit `.gitignore` (currently at root):

   - Verify excludes: `.env*`, `.env.local`, `frontend/.next/`, `frontend/node_modules/`, `frontend/playwright-report/`, `frontend/test-results/`, `supabase/.temp/`
   - Add if missing: `*.log`, `.DS_Store`, `.turbo/`, `.supabase/`, `coverage/`, `dist/`

3. Create `.env.example` at root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Test Environment (for Playwright)
   SUPABASE_TEST_URL=https://your-project.supabase.co
   SUPABASE_TEST_ANON_KEY=your-anon-key
   SUPABASE_TEST_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_SERVICE_ROLE_USER_ID=service-role-user-id
   
   # Node Environment
   NODE_ENV=development
   PLAYWRIGHT_TEST=false
   ```

4. Create `docs/ENVIRONMENT_SETUP.md` with:

   - Copy `.env.example` to `.env.local` instructions
   - Test environment setup (`.env.test.local`)
   - Required Supabase project configuration
   - Local development prerequisites

#### Task 1.2: Consolidate Package Management

**Files:** `package.json` (root), `frontend/package.json`, `docs/DEVELOPMENT.md` (to update)

**Difficulty:** M

**Risk:** Medium (build scripts)

1. Audit root `package.json`:

   - Current scripts reference `next dev frontend` (invalid)
   - Determine if root package.json is needed for monorepo tooling or can be removed

2. Decision point:

   - **Option A (Recommended):** Remove root `package.json`, use `frontend/package.json` only
     - Update all documentation to reference `cd frontend && npm install`
     - Update CI/CD to work from `frontend/` directory
   - **Option B:** Keep root for workspace management, fix scripts:
     - Change `"dev": "next dev frontend"` → `"dev": "cd frontend && next dev"`
     - Or use `npm-run-all` / `concurrently` for multi-package workspaces

3. Update `frontend/package.json` scripts if needed:

   - Ensure `dev`, `build`, `start`, `lint`, `test:e2e` are correct
   - Add `typecheck` script: `"typecheck": "tsc --noEmit"`

4. Update documentation:

   - `docs/README.md` - Update run instructions
   - `docs/REPO_STRUCTURE.md` - Clarify package.json location

#### Task 1.3: Resolve Next.js Middleware Deprecation

**Files:** `frontend/lib/auth/middleware-helpers.ts` (verify), `frontend/app/**/route.ts` (check for middleware usage), `next.config.ts`

**Difficulty:** M

**Risk:** Medium (routing behavior)

1. Identify middleware usage:

   - Search for `middleware.ts` or `middleware()` exports
   - Check `next.config.ts` for middleware configuration
   - Review `frontend/lib/auth/middleware-helpers.ts` for usage patterns

2. Migrate to Next.js 16 `proxy` pattern:

   - If using `middleware.ts`, convert to route handlers with `NextRequest`/`NextResponse`
   - Update auth checks to use server components/actions instead
   - Remove deprecated middleware file if exists

3. Verify routes:

   - Test protected routes (`/dashboard`, `/properties/*`)
   - Test public routes (`/`, `/search`, `/p/[slug]`)
   - Ensure auth redirects work correctly

#### Task 1.4: Property-Scoped Storage Policies

**Files:** `supabase/migrations/20241201000005_storage_buckets.sql` (to update), new migration `20250321000000_storage_policies_property_scoped.sql`

**Difficulty:** L

**Risk:** High (access control)

1. Audit current storage policies:

   - Current: `authenticated_read_documents` allows any authenticated user to read any document
   - Current: `public_read_photos` allows public read (too permissive for private properties)

2. Design property-scoped policies:

   - Documents: Require `can_view_property(property_id)` via helper function
   - Photos: Public read only for `public_visibility = true` properties; authenticated read requires property access

3. Create migration `20250321000000_storage_policies_property_scoped.sql`:
   ```sql
   -- Drop existing overly permissive policies
   DROP POLICY IF EXISTS "authenticated_read_documents" ON storage.objects;
   DROP POLICY IF EXISTS "public_read_photos" ON storage.objects;
   
   -- Property-scoped document read (requires property access)
   CREATE POLICY "property_scoped_read_documents"
   ON storage.objects FOR SELECT TO authenticated
   USING (
     bucket_id = 'property-documents'
     AND EXISTS (
       SELECT 1 FROM public.documents d
       WHERE d.storage_path = (storage.objects.name)
       AND public.can_view_property(d.property_id)
     )
   );
   
   -- Property-scoped photo read (public for public_visibility=true, authenticated for property access)
   CREATE POLICY "property_scoped_read_photos_public"
   ON storage.objects FOR SELECT TO anon
   USING (
     bucket_id = 'property-photos'
     AND EXISTS (
       SELECT 1 FROM public.media m
       JOIN public.properties p ON p.id = m.property_id
       WHERE m.storage_path = (storage.objects.name)
       AND p.public_visibility = true
       AND p.deleted_at IS NULL
     )
   );
   
   CREATE POLICY "property_scoped_read_photos_authenticated"
   ON storage.objects FOR SELECT TO authenticated
   USING (
     bucket_id = 'property-photos'
     AND EXISTS (
       SELECT 1 FROM public.media m
       WHERE m.storage_path = (storage.objects.name)
       AND public.can_view_property(m.property_id)
     )
   );
   ```

4. Test storage access:

   - Verify owners can access their property documents/photos
   - Verify viewers can access shared property media
   - Verify public can access public_visibility=true photos only
   - Verify unauthorized users cannot access private property media

#### Task 1.5: Align Seed Data with New Role Model

**Files:** `supabase/seed.sql`, `frontend/app/api/test/reset/route.ts`

**Difficulty:** M

**Risk:** Low (test data only)

1. Audit `supabase/seed.sql`:

   - Current: Uses `primary_role: 'owner'` (invalid enum - should be `consumer`, `agent`, `conveyancer`, `surveyor`, `admin`)
   - Current: Uses `role: 'owner'`, `role: 'editor'`, `role: 'viewer'` in `property_stakeholders` (needs `status` and `permission`)

2. Update seed data:
   ```sql
   -- Fix users.primary_role
   UPDATE: 'owner' → 'consumer', 'viewer' → 'consumer', keep 'admin'
   
   -- Fix property_stakeholders
   UPDATE: Add status='owner' where role='owner', permission='editor' where role IN ('owner','editor'), permission='viewer' where role='viewer'
   ```

3. Update `frontend/app/api/test/reset/route.ts`:

   - Verify `SEED_USERS` uses correct `primary_role` enum values
   - Verify `stakeholder` objects use `status` and `permission` fields correctly
   - Test reset route still works after changes

4. Test seed:
   ```bash
   supabase db reset
   # Verify no errors, check users and stakeholders tables
   ```


### Dependencies & Ordering

- **Task 1.1** (env files) can run in parallel with others
- **Task 1.2** (package.json) must complete before CI/CD updates
- **Task 1.3** (middleware) should complete before Phase 2 (performance work may touch routing)
- **Task 1.4** (storage policies) is independent but high-risk; test thoroughly
- **Task 1.5** (seed) can run in parallel but should complete before Phase 3 (tests use seed)

**Unlocks:**

- Phase 2 (performance) requires clean build
- Phase 3 (testing) requires working seed data

### Testing & Validation Plan

1. **Manual Checks:**

   - Run `git status` - verify no `.env.local` or build artifacts
   - Run `npm run build` in `frontend/` - verify no warnings
   - Run `supabase db reset` - verify seed applies without errors
   - Test storage access: upload document as owner, verify viewer can access, verify anonymous cannot

2. **Automated Checks:**

   - Add pre-commit hook (via Husky) to prevent `.env*` commits
   - Add CI check: `git ls-files | grep -E '\.env'` should return empty

3. **Storage Policy Tests:**

   - Create test script: `frontend/tests/helpers/storage-access.test.ts`
   - Test cases:
     - Owner can read own property documents/photos
     - Viewer can read shared property media
     - Anonymous can read public_visibility=true photos only
     - Unauthorized user cannot read private property media

### Performance & Security Considerations

- **Security:** Storage policies are critical - incorrect policies could expose sensitive documents. Test thoroughly.
- **Performance:** No performance impact in this phase (hygiene only).

### Acceptance Criteria & Metrics

- ✅ Zero `.env*` files in git history (verified via `git ls-files`)
- ✅ `.gitignore` excludes all build artifacts, test outputs, env files
- ✅ `npm run build` passes with zero warnings
- ✅ Storage policies enforce property-scoped access (100% of buckets)
- ✅ Seed data uses correct enums (verified via `supabase db reset`)

### Nice-to-Haves

- Add `direnv` support for automatic env loading
- Add `pre-commit` hooks for linting/formatting
- Add `commitlint` for conventional commits

---

## Phase 2 – Database Performance & Query Optimisation

### Goal & Definition of Done

Eliminate N+1 queries, add critical database indexes, implement pagination for large datasets, enable full-text search, and cache signed URLs to reduce latency. Success means: dashboard loads <800ms with 50 properties, property lists paginated, search uses FTS, signed URLs cached, and all identified N+1 patterns resolved.

**Definition of Done:**

- [ ] All identified N+1 queries batched or eliminated
- [ ] Critical indexes added (stakeholders, events, documents, media, invitations)
- [ ] Pagination implemented for property lists, activity timelines, document/media lists
- [ ] Full-text search (FTS) enabled for property search
- [ ] Signed URL caching implemented (in-memory or DB table)
- [ ] Dashboard load time <800ms with 50 properties (local dev)
- [ ] Search response time <200ms for typical queries

### Scope – In / Out

**In Scope:**

- Database indexes on frequently queried columns
- Query batching in dashboard and property pages
- Pagination API design and implementation
- FTS index creation and RPC updates
- Signed URL caching strategy and implementation
- Performance monitoring and metrics

**Out of Scope:**

- External API integrations (Phase 4)
- Frontend feature additions (Phase 5)
- Admin UI (Phase 6)

### Concrete Tasks / Work Items

#### Task 2.1: Add Critical Database Indexes

**Files:** New migration `20250322000000_performance_indexes.sql`

**Difficulty:** S

**Risk:** Low (additive only)

1. Analyze query patterns:

   - Review `frontend/app/(app)/dashboard/page.tsx` - queries `property_stakeholders`, `media`, `property_events`
   - Review `frontend/components/property/property-list.tsx` - queries `properties`, `media`
   - Review RPC functions for common WHERE clauses

2. Create migration with indexes:
   ```sql
   -- Property stakeholders (most common query: user_id + property_id + deleted_at)
   CREATE INDEX IF NOT EXISTS idx_property_stakeholders_user_property_active
   ON public.property_stakeholders(user_id, property_id, deleted_at)
   WHERE deleted_at IS NULL;
   
   CREATE INDEX IF NOT EXISTS idx_property_stakeholders_property_active
   ON public.property_stakeholders(property_id, deleted_at, expires_at)
   WHERE deleted_at IS NULL;
   
   -- Property events (timeline queries: property_id + created_at DESC)
   CREATE INDEX IF NOT EXISTS idx_property_events_property_created_desc
   ON public.property_events(property_id, created_at DESC);
   
   -- Documents (property queries: property_id + deleted_at)
   CREATE INDEX IF NOT EXISTS idx_documents_property_active
   ON public.documents(property_id, deleted_at, document_type)
   WHERE deleted_at IS NULL;
   
   -- Media (property queries: property_id + deleted_at + media_type)
   CREATE INDEX IF NOT EXISTS idx_media_property_active_type
   ON public.media(property_id, deleted_at, media_type, created_at)
   WHERE deleted_at IS NULL;
   
   -- Featured media (common query: property_id + is_featured + status)
   CREATE INDEX IF NOT EXISTS idx_media_featured
   ON public.media(property_id, is_featured, status, deleted_at)
   WHERE is_featured = true AND status = 'active' AND deleted_at IS NULL;
   
   -- Invitations (property queries: property_id + email)
   CREATE INDEX IF NOT EXISTS idx_invitations_property_email
   ON public.invitations(property_id, email, status);
   
   -- Tasks (property queries: property_id + status + due_date)
   CREATE INDEX IF NOT EXISTS idx_tasks_property_status_due
   ON public.tasks(property_id, status, due_date)
   WHERE status NOT IN ('resolved', 'cancelled');
   ```

3. Verify index usage:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM property_stakeholders
   WHERE user_id = '...' AND deleted_at IS NULL;
   ```


#### Task 2.2: Batch Dashboard Queries

**Files:** `frontend/app/(app)/dashboard/page.tsx`

**Difficulty:** M

**Risk:** Medium (data fetching logic)

1. Identify N+1 patterns:

   - Current: `Promise.all(accessList.map(async (entry) => { await getCompletion(...); await getSignedUrl(...); }))`
   - Each property triggers 2 separate async calls

2. Batch completion scores:

   - Create RPC: `get_properties_completion(property_ids[])` that returns `{property_id, completion}[]`
   - Or use single query with `IN` clause and aggregate in application

3. Batch signed URL generation:

   - Collect all `storage_path` values
   - Generate signed URLs in parallel with concurrency limit (e.g., 10 at a time)
   - Use `Promise.allSettled` to handle failures gracefully

4. Refactor dashboard:
   ```typescript
   // Before: N+1
   const hydrated = await Promise.all(
     accessList.map(async (entry) => {
       const completion = await getCompletion(supabase, entry.property.id);
       const imageUrl = await getSignedUrl(...);
     })
   );
   
   // After: Batched
   const propertyIds = accessList.map(e => e.property.id);
   const completions = await getBatchCompletion(supabase, propertyIds);
   const signedUrls = await getBatchSignedUrls(supabase, mediaPaths);
   const hydrated = accessList.map(entry => ({
     ...entry,
     completion: completions[entry.property.id],
     imageUrl: signedUrls[entry.mediaPath] || FALLBACK_IMAGE
   }));
   ```


#### Task 2.3: Implement Pagination

**Files:** `frontend/components/property/property-list.tsx`, `frontend/app/(public)/search/page.tsx`, new RPCs

**Difficulty:** L

**Risk:** Medium (API changes)

1. Design pagination API:

   - Use cursor-based pagination (more efficient than offset)
   - Or offset-based if simpler (limit/offset)
   - Return: `{data, next_cursor, has_more}`

2. Update `search_properties` RPC:
   ```sql
   CREATE OR REPLACE FUNCTION public.search_properties(
     query_text text,
     result_limit int DEFAULT 50,
     cursor_id uuid DEFAULT NULL  -- cursor-based
   )
   RETURNS TABLE (...)
   ```

3. Update property list component:

   - Add `limit` and `offset` (or `cursor`) params
   - Implement "Load More" button or infinite scroll
   - Update UI to show "Showing X of Y properties"

4. Paginate activity timeline:

   - Update `get_recent_activity` RPC to accept `limit`/`offset`
   - Add pagination controls to `ActivityTimeline` component

5. Paginate document/media lists:

   - Add pagination to `PropertyDocuments` and `PropertyGallery` components
   - Use server-side pagination (not client-side filtering)

#### Task 2.4: Enable Full-Text Search (FTS)

**Files:** New migration `20250323000000_fts_indexes.sql`, `supabase/migrations/20241201000007_search_properties_rpc.sql` (to update)

**Difficulty:** L

**Risk:** Medium (search behavior changes)

1. Create FTS indexes:
   ```sql
   -- Add tsvector column to properties
   ALTER TABLE public.properties
   ADD COLUMN IF NOT EXISTS search_vector tsvector;
   
   -- Create GIN index for FTS
   CREATE INDEX IF NOT EXISTS idx_properties_search_vector
   ON public.properties USING GIN(search_vector);
   
   -- Create function to update search_vector
   CREATE OR REPLACE FUNCTION public.update_property_search_vector()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.search_vector :=
       setweight(to_tsvector('english', COALESCE(NEW.display_address, '')), 'A') ||
       setweight(to_tsvector('english', COALESCE(NEW.uprn, '')), 'B');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   -- Create trigger
   DROP TRIGGER IF EXISTS property_search_vector_update ON public.properties;
   CREATE TRIGGER property_search_vector_update
   BEFORE INSERT OR UPDATE ON public.properties
   FOR EACH ROW EXECUTE FUNCTION public.update_property_search_vector();
   
   -- Backfill existing rows
   UPDATE public.properties
   SET search_vector = 
     setweight(to_tsvector('english', COALESCE(display_address, '')), 'A') ||
     setweight(to_tsvector('english', COALESCE(uprn, '')), 'B');
   ```

2. Update `search_properties` RPC to use FTS:
   ```sql
   CREATE OR REPLACE FUNCTION public.search_properties(
     query_text text,
     result_limit int DEFAULT 50
   )
   RETURNS TABLE (...)
   AS $$
   BEGIN
     RETURN QUERY
     SELECT ...
     FROM public.properties p
     WHERE p.deleted_at IS NULL
       AND (
         p.search_vector @@ plainto_tsquery('english', query_text)
         OR p.uprn ILIKE '%' || query_text || '%'
       )
     ORDER BY
       ts_rank(p.search_vector, plainto_tsquery('english', query_text)) DESC,
       p.created_at DESC
     LIMIT result_limit;
   END;
   $$;
   ```

3. Test search:

   - Verify FTS matches partial words
   - Verify UPRN exact match still works
   - Verify relevance ranking

#### Task 2.5: Implement Signed URL Caching

**Files:** New migration `20250324000000_signed_url_cache.sql`, `frontend/lib/signed-url.ts` (to update), new server action or RPC

**Difficulty:** M

**Risk:** Low (additive feature)

1. Design cache strategy:

   - **Option A:** In-memory cache (Next.js server, simple, but lost on restart)
   - **Option B:** Database table (persistent, but adds DB queries)
   - **Option C:** Redis (best performance, but requires infrastructure)

**Recommendation:** Start with Option A (in-memory), migrate to Option B if needed.

2. Create in-memory cache:
   ```typescript
   // frontend/lib/signed-url-cache.ts
   const cache = new Map<string, {url: string, expiresAt: number}>();
   const CACHE_TTL = 3600 * 1000; // 1 hour in ms
   
   export function getCachedSignedUrl(bucket: string, path: string): string | null {
     const key = `${bucket}:${path}`;
     const cached = cache.get(key);
     if (cached && cached.expiresAt > Date.now()) {
       return cached.url;
     }
     return null;
   }
   
   export function setCachedSignedUrl(bucket: string, path: string, url: string): void {
     const key = `${bucket}:${path}`;
     cache.set(key, {
       url,
       expiresAt: Date.now() + CACHE_TTL
     });
   }
   ```

3. Update `frontend/lib/signed-url.ts`:
   ```typescript
   export async function getSignedUrl(...): Promise<string | null> {
     // Check cache first
     const cached = getCachedSignedUrl(bucket, path);
     if (cached) return cached;
     
     // Generate new URL
     const url = await generateSignedUrl(...);
     if (url) setCachedSignedUrl(bucket, path, url);
     return url;
   }
   ```

4. Add cache cleanup (optional):

   - Periodic cleanup of expired entries
   - Or let them expire naturally (memory-efficient)

### Dependencies & Ordering

- **Task 2.1** (indexes) should complete first (unlocks query optimization)
- **Task 2.2** (batching) can run in parallel with 2.3, 2.4, 2.5
- **Task 2.3** (pagination) is independent
- **Task 2.4** (FTS) is independent
- **Task 2.5** (caching) is independent

**Unlocks:**

- Phase 3 (testing) benefits from faster queries
- Phase 4 (external APIs) may need similar caching

### Testing & Validation Plan

1. **Performance Tests:**

   - Create `frontend/tests/performance/dashboard-load.test.ts`
   - Measure dashboard load time with 10, 50, 100 properties
   - Target: <800ms for 50 properties

2. **Query Analysis:**

   - Use `EXPLAIN ANALYZE` on slow queries
   - Verify indexes are used (check `Index Scan` in plan)

3. **Pagination Tests:**

   - Test property list pagination (10, 20, 50 per page)
   - Test search pagination
   - Test activity timeline pagination

4. **FTS Tests:**

   - Test partial word matching
   - Test relevance ranking
   - Test UPRN exact match fallback

5. **Cache Tests:**

   - Verify cache hit on second request
   - Verify cache miss after expiry
   - Test cache with concurrent requests

### Performance & Security Considerations

- **Performance:** Indexes may slow down writes slightly (acceptable trade-off)
- **Security:** FTS indexes don't expose additional data (safe)
- **Caching:** Signed URLs expire after 1 hour (security maintained)

### Acceptance Criteria & Metrics

- ✅ Dashboard load time <800ms with 50 properties (local dev)
- ✅ Search response time <200ms for typical queries
- ✅ All identified N+1 queries eliminated (verified via query logs)
- ✅ Pagination implemented for property lists, activity, documents/media
- ✅ FTS enabled and tested (verified via search results)
- ✅ Signed URL cache hit rate >80% on repeated requests

### Nice-to-Haves

- Add query performance monitoring (log slow queries)
- Add cache metrics (hit rate, size)
- Implement Redis cache for production scale

---

## Phase 3 – Testing Foundation (RLS, Server Actions, E2E)

### Goal & Definition of Done

Establish comprehensive test coverage for RLS policies, server actions, and critical user journeys. Success means: RLS tests cover all role combinations, server action integration tests cover all actions, E2E tests cover critical flows (login, dashboard, property creation, document upload, public passport), and CI runs all tests automatically.

**Definition of Done:**

- [ ] RLS test suite covers: owner, buyer, tenant, agent, conveyancer, surveyor, admin roles
- [ ] RLS tests cover: viewer vs editor permissions, public visibility, expired access
- [ ] Server action integration tests cover: upload doc/media, delete, grant/revoke roles, set_public_visibility, tasks
- [ ] E2E tests cover: login, dashboard, property creation, document upload, public passport view
- [ ] All tests pass in CI
- [ ] Test coverage >60% for critical paths

### Scope – In / Out

**In Scope:**

- RLS policy tests (all role combinations)
- Server action integration tests
- E2E tests for critical user journeys
- Test infrastructure (fixtures, helpers, seed data)
- CI integration

**Out of Scope:**

- Unit tests for utility functions (can be added later)
- Visual regression tests (can be added later)
- Load/performance tests (covered in Phase 2 validation)

### Concrete Tasks / Work Items

#### Task 3.1: Expand RLS Test Suite

**Files:** `frontend/tests/rls.spec.ts` (to expand), new files: `frontend/tests/rls/owner-permissions.spec.ts`, `frontend/tests/rls/viewer-permissions.spec.ts`, `frontend/tests/rls/public-visibility.spec.ts`, `frontend/tests/rls/expired-access.spec.ts`

**Difficulty:** M

**Risk:** Low (test-only)

1. Analyze current RLS test:

   - Current: `frontend/tests/rls.spec.ts` tests viewer/editor/owner basics
   - Missing: tenant, agent, conveyancer, surveyor, admin roles
   - Missing: public visibility scenarios
   - Missing: expired access scenarios

2. Create comprehensive RLS test structure:
   ```
   frontend/tests/rls/
   ├── owner-permissions.spec.ts      # Owner can do everything
   ├── buyer-permissions.spec.ts      # Buyer can view shared properties
   ├── tenant-permissions.spec.ts      # Tenant can view own property
   ├── agent-permissions.spec.ts      # Agent can edit assigned properties
   ├── conveyancer-permissions.spec.ts # Conveyancer can view/edit legal docs
   ├── surveyor-permissions.spec.ts    # Surveyor can upload surveys
   ├── admin-permissions.spec.ts      # Admin bypasses RLS
   ├── viewer-vs-editor.spec.ts       # Permission level differences
   ├── public-visibility.spec.ts      # Public property access
   └── expired-access.spec.ts         # Time-bound access expiry
   ```

3. Test cases per file (example: `owner-permissions.spec.ts`):
   ```typescript
   describe('Owner Permissions', () => {
     it('can view own property', async () => { ... });
     it('can edit own property', async () => { ... });
     it('can upload documents to own property', async () => { ... });
     it('can delete documents from own property', async () => { ... });
     it('can grant roles to other users', async () => { ... });
     it('cannot revoke other owners', async () => { ... });
     it('can set public visibility', async () => { ... });
   });
   ```

4. Test public visibility:
   ```typescript
   describe('Public Visibility', () => {
     it('anonymous user can view public property basic info', async () => { ... });
     it('anonymous user cannot view private property', async () => { ... });
     it('anonymous user can view public property photos', async () => { ... });
     it('anonymous user cannot view public property documents', async () => { ... });
   });
   ```

5. Test expired access:
   ```typescript
   describe('Expired Access', () => {
     it('viewer cannot access property after expires_at', async () => { ... });
     it('editor cannot access property after expires_at', async () => { ... });
     it('expired access does not affect owners', async () => { ... });
   });
   ```


#### Task 3.2: Server Action Integration Tests

**Files:** New directory `frontend/tests/integration/`, files: `upload-document.spec.ts`, `upload-media.spec.ts`, `delete-document.spec.ts`, `grant-role.spec.ts`, `set-visibility.spec.ts`, `tasks.spec.ts`

**Difficulty:** L

**Risk:** Medium (requires test Supabase instance)

1. Set up test infrastructure:

   - Use `frontend/app/api/test/reset/route.ts` for test data seeding
   - Create test helpers: `frontend/tests/helpers/test-supabase.ts`
   - Create test fixtures: `frontend/tests/fixtures/properties.ts`, `frontend/tests/fixtures/users.ts`

2. Test upload document action:
   ```typescript
   // frontend/tests/integration/upload-document.spec.ts
   describe('uploadPropertyDocument', () => {
     it('owner can upload document', async () => {
       const formData = new FormData();
       formData.append('file', new Blob(['test'], {type: 'application/pdf'}), 'test.pdf');
       formData.append('document_type', 'other');
       formData.append('title', 'Test Document');
       
       const result = await uploadPropertyDocument(propertyId, formData);
       expect(result.success).toBe(true);
       expect(result.documentId).toBeDefined();
     });
     
     it('viewer cannot upload document', async () => { ... });
     it('validates file type', async () => { ... });
     it('validates file size', async () => { ... });
   });
   ```

3. Test grant/revoke role actions:
   ```typescript
   describe('grantPropertyRole', () => {
     it('owner can grant viewer role', async () => { ... });
     it('owner can grant editor role', async () => { ... });
     it('viewer cannot grant roles', async () => { ... });
     it('validates user exists', async () => { ... });
   });
   ```

4. Test set public visibility:
   ```typescript
   describe('setPublicVisibility', () => {
     it('owner can set public visibility', async () => { ... });
     it('viewer cannot set public visibility', async () => { ... });
     it('generates slug when setting to public', async () => { ... });
   });
   ```

5. Test tasks actions:
   ```typescript
   describe('tasks actions', () => {
     it('owner can create task', async () => { ... });
     it('editor can create task', async () => { ... });
     it('viewer cannot create task', async () => { ... });
     it('assigned user can update task status', async () => { ... });
   });
   ```


#### Task 3.3: E2E Test Suite

**Files:** Expand `frontend/tests/e2e/` (11 files exist, verify coverage)

**Difficulty:** L

**Risk:** Medium (requires stable test environment)

1. Audit existing E2E tests:

   - Current: `auth.spec.ts`, `dashboard.spec.ts`, `create-property.spec.ts`, `public-passport.spec.ts`, etc.
   - Verify all critical flows are covered

2. Critical user journeys to test:

   - **Journey 1: New User Registration & First Property**
     - Register account
     - Login
     - Create property
     - Upload document
     - Upload photo
     - Set public visibility

   - **Journey 2: Property Sharing & Collaboration**
     - Owner grants viewer role
     - Viewer logs in, views shared property
     - Viewer cannot edit/upload
     - Owner revokes role

   - **Journey 3: Public Property Discovery**
     - Anonymous user searches properties
     - Views public passport
     - Cannot access private properties

   - **Journey 4: Dashboard & Property Management**
     - Login as owner
     - View dashboard (KPIs, properties, activity)
     - Navigate to property detail
     - Edit property
     - Manage stakeholders
     - Create task

3. Update/expand E2E tests:
   ```typescript
   // frontend/tests/e2e/new-user-journey.spec.ts
   test('new user can register and create first property', async ({ page }) => {
     await page.goto('/auth/register');
     await page.fill('input[name="email"]', 'newuser@test.com');
     await page.fill('input[name="password"]', 'TestPassword123!');
     await page.click('button[type="submit"]');
     
     await page.waitForURL('/dashboard');
     await page.click('text=Add property');
     // ... continue flow
   });
   ```

4. Add test data management:

   - Use `frontend/app/api/test/reset/route.ts` in `beforeEach`
   - Ensure tests are isolated (no shared state)

5. Configure Playwright:

   - Update `frontend/playwright.config.ts` if needed
   - Ensure workers=1 for test isolation
   - Add retry logic for flaky tests

### Dependencies & Ordering

- **Task 3.1** (RLS tests) can run in parallel with 3.2, 3.3
- **Task 3.2** (server actions) requires test Supabase instance
- **Task 3.3** (E2E) requires working frontend and test data

**Unlocks:**

- Phase 4+ can rely on test coverage for regression prevention

### Testing & Validation Plan

1. **RLS Tests:**

   - Run: `npm run test:rls` (add script to `package.json`)
   - Verify all role combinations tested
   - Verify public visibility scenarios tested

2. **Integration Tests:**

   - Run: `npm run test:integration`
   - Verify all server actions tested
   - Verify error cases covered

3. **E2E Tests:**

   - Run: `npm run test:e2e`
   - Verify all critical journeys pass
   - Verify tests are stable (no flakiness)

4. **CI Integration:**

   - Add test steps to CI workflow
   - Run tests on every PR
   - Block merge if tests fail

### Performance & Security Considerations

- **Performance:** Tests should run in <5 minutes total
- **Security:** Test data should not contain real PII
- **Isolation:** Each test should be independent (no shared state)

### Acceptance Criteria & Metrics

- ✅ RLS tests cover all role combinations (owner, buyer, tenant, agent, conveyancer, surveyor, admin)
- ✅ RLS tests cover viewer vs editor permissions
- ✅ RLS tests cover public visibility and expired access
- ✅ Server action integration tests cover all actions (upload, delete, grant, revoke, visibility, tasks)
- ✅ E2E tests cover: login, dashboard, property creation, document upload, public passport
- ✅ All tests pass in CI
- ✅ Test coverage >60% for critical paths

### Nice-to-Haves

- Add visual regression tests (Playwright screenshots)
- Add accessibility tests (axe-core)
- Add performance tests (Lighthouse CI)

---

## Phase 4 – External Data Integrations (Edge Functions)

### Goal & Definition of Done

Implement Edge Functions for external UK government APIs (EPC, HMLR, Flood Risk, Crime Data) with caching, error handling, and frontend hooks/components. Success means: EPC data displays on property pages, flood risk shows with mitigation advice, crime statistics display, HMLR title data available, and all API calls are cached and rate-limited.

**Definition of Done:**

- [ ] Edge Functions created for: EPC, HMLR, Flood Risk, Crime Data
- [ ] `api_cache` table created with RLS
- [ ] Frontend hooks: `useEpcData`, `useFloodRisk`, `useCrimeData`, `useHmlrData`
- [ ] UI components: EPC card, Flood card, Crime card, Title card, Planning card
- [ ] API cache table with TTL and refresh strategy
- [ ] Rate limiting and error handling in Edge Functions
- [ ] All API calls cached with appropriate TTLs

### Scope – In / Out

**In Scope:**

- Supabase Edge Functions for external APIs (EPC, HMLR, Flood, Crime, Planning)
- `api_cache` table schema and RLS policies
- Frontend React Query hooks for API data
- UI card components for displaying API data
- Caching strategy and cache invalidation
- Error handling and fallback states
- Rate limiting and circuit breakers

**Out of Scope:**

- Advanced user features (Phase 5)
- Admin UI (Phase 6)
- Real-time API updates (can be added later)
- API webhook integrations (can be added later)

### Concrete Tasks / Work Items

#### Task 4.1: Create API Cache Table

**Files:** New migration `20250325000000_api_cache_table.sql`

**Difficulty:** S

**Risk:** Low (additive only)

1. Design `api_cache` table schema:
   ```sql
   CREATE TABLE IF NOT EXISTS public.api_cache (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
     api_provider TEXT NOT NULL CHECK (api_provider IN ('epc', 'hmlr', 'flood', 'crime', 'planning', 'postcodes')),
     cache_key TEXT NOT NULL, -- e.g., UPRN, postcode, title_number
     payload JSONB NOT NULL,
     fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     expires_at TIMESTAMPTZ NOT NULL,
     etag TEXT, -- For conditional requests
     request_hash TEXT, -- Hash of request params for deduplication
     response_size_bytes INTEGER,
     error_message TEXT, -- Store errors to avoid retrying immediately
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(api_provider, cache_key)
   );
   
   CREATE INDEX idx_api_cache_property_provider
   ON public.api_cache(property_id, api_provider)
   WHERE property_id IS NOT NULL;
   
   CREATE INDEX idx_api_cache_expires
   ON public.api_cache(expires_at)
   WHERE expires_at > NOW();
   
   CREATE INDEX idx_api_cache_key_provider
   ON public.api_cache(api_provider, cache_key);
   ```

2. Add RLS policies:
   ```sql
   ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;
   
   -- Users can view cached data for properties they can access
   CREATE POLICY "api_cache_select"
   ON public.api_cache FOR SELECT
   TO authenticated
   USING (
     property_id IS NULL OR public.can_view_property(property_id)
   );
   
   -- Only service role can insert/update (via Edge Functions)
   CREATE POLICY "api_cache_insert"
   ON public.api_cache FOR INSERT
   TO service_role
   WITH CHECK (true);
   
   CREATE POLICY "api_cache_update"
   ON public.api_cache FOR UPDATE
   TO service_role
   USING (true);
   ```

3. Create helper RPC for cache retrieval:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_cached_api_data(
     p_provider TEXT,
     p_cache_key TEXT
   )
   RETURNS JSONB
   LANGUAGE sql
   STABLE
   AS $
     SELECT payload
     FROM public.api_cache
     WHERE api_provider = p_provider
       AND cache_key = p_cache_key
       AND expires_at > NOW()
       AND error_message IS NULL
     LIMIT 1;
   $;
   ```

#### Task 4.2: EPC Register API Edge Function

**Files:** `supabase/functions/api-epc/index.ts` (to create), `supabase/functions/_shared/` (shared utilities)

**Difficulty:** L

**Risk:** Medium (external API dependency)

1. Create Edge Function structure:
   ```
   supabase/functions/
   ├── api-epc/
   │   └── index.ts
   └── _shared/
       ├── types.ts
       ├── cache.ts
       ├── validation.ts
       └── errors.ts
   ```

2. Implement EPC Edge Function:
   ```typescript
   // supabase/functions/api-epc/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
   import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
   
   const RequestSchema = z.object({
     uprn: z.string().optional(),
     postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i).optional(),
     address: z.string().optional(),
   }).refine(data => data.uprn || data.postcode || data.address, {
     message: "At least one of uprn, postcode, or address must be provided"
   });
   
   serve(async (req: Request) => {
     // CORS handling
     if (req.method === 'OPTIONS') {
       return new Response(null, { status: 204 });
     }
     
     try {
       // Validate request
       const body = await req.json();
       const params = RequestSchema.parse(body);
       
       // Initialize Supabase client
       const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
       const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
       const supabase = createClient(supabaseUrl, supabaseServiceKey);
       
       // Check cache
       const cacheKey = params.uprn || params.postcode || params.address;
       const cached = await supabase
         .from('api_cache')
         .select('payload, expires_at')
         .eq('api_provider', 'epc')
         .eq('cache_key', cacheKey)
         .gt('expires_at', new Date().toISOString())
         .single();
       
       if (cached.data) {
         return new Response(JSON.stringify(cached.data.payload), {
           headers: { 'Content-Type': 'application/json' },
         });
       }
       
       // Call EPC API
       const epcApiKey = Deno.env.get('EPC_API_KEY');
       const epcUrl = `https://epc.opendatacommunities.org/api/v1/domestic/search`;
       const response = await fetch(epcUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Basic ${btoa(epcApiKey + ':')}`,
           'Accept': 'application/json',
         },
         body: JSON.stringify(params),
       });
       
       if (!response.ok) {
         throw new Error(`EPC API error: ${response.statusText}`);
       }
       
       const data = await response.json();
       
       // Cache result (1 week TTL for EPC data)
       const expiresAt = new Date();
       expiresAt.setDate(expiresAt.getDate() + 7);
       
       await supabase.from('api_cache').upsert({
         api_provider: 'epc',
         cache_key: cacheKey,
         payload: data,
         expires_at: expiresAt.toISOString(),
       });
       
       return new Response(JSON.stringify(data), {
         headers: { 'Content-Type': 'application/json' },
       });
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 400, headers: { 'Content-Type': 'application/json' } }
       );
     }
   });
   ```

3. Deploy Edge Function:
   ```bash
   supabase functions deploy api-epc
   ```

#### Task 4.3: Flood Risk API Edge Function

**Files:** `supabase/functions/api-flood/index.ts` (to create)

**Difficulty:** M

**Risk:** Medium (external API dependency)

1. Implement Flood Risk Edge Function (similar structure to EPC):
   - Use Environment Agency Flood Risk API
   - Cache with 1 month TTL (flood risk changes slowly)
   - Handle coordinate-based queries (latitude/longitude)
   - Return risk levels: low, medium, high, very high

2. Error handling:
   - Handle API rate limits
   - Return cached data if API fails
   - Log errors for monitoring

#### Task 4.4: HMLR (Land Registry) API Edge Function

**Files:** `supabase/functions/api-hmlr/index.ts` (to create)

**Difficulty:** L

**Risk:** Medium (external API dependency)

1. Implement HMLR Edge Function:
   - Use HM Land Registry Open Data APIs
   - Support title number lookup
   - Support price paid data queries
   - Cache with 1 month TTL

2. Data transformation:
   - Normalize title data format
   - Extract key fields (title number, tenure, price history)

#### Task 4.5: Crime Data API Edge Function

**Files:** `supabase/functions/api-crime/index.ts` (to create)

**Difficulty:** M

**Risk:** Low (public API, no auth required)

1. Implement Crime Data Edge Function:
   - Use Police.uk API (no auth required)
   - Support location-based queries (latitude/longitude)
   - Aggregate crime categories
   - Cache with 1 week TTL (crime data updates monthly)

2. Data processing:
   - Group by crime category
   - Calculate crime rate per 1000 population
   - Return trends (if historical data available)

#### Task 4.6: Frontend Hooks for API Data

**Files:** `frontend/hooks/use-epc-data.ts`, `frontend/hooks/use-flood-risk.ts`, `frontend/hooks/use-crime-data.ts`, `frontend/hooks/use-hmlr-data.ts` (to create)

**Difficulty:** M

**Risk:** Low (frontend only)

1. Create React Query hooks:
   ```typescript
   // frontend/hooks/use-epc-data.ts
   import { useQuery } from '@tanstack/react-query';
   import { createClient } from '@/lib/supabase/server';
   
   export function useEpcData(propertyId: string, uprn?: string, postcode?: string) {
     return useQuery({
       queryKey: ['epc', propertyId, uprn, postcode],
       queryFn: async () => {
         const supabase = createClient();
         const { data, error } = await supabase.functions.invoke('api-epc', {
           body: { uprn, postcode },
         });
         if (error) throw error;
         return data;
       },
       enabled: !!propertyId && (!!uprn || !!postcode),
       staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
     });
   }
   ```

2. Create similar hooks for flood, crime, HMLR

3. Add error handling and loading states

#### Task 4.7: UI Components for API Data

**Files:** Update existing stubs: `frontend/components/property/cards/epc-card.tsx`, `flood-card.tsx`, `planning-card.tsx`, `title-card.tsx`

**Difficulty:** M

**Risk:** Low (UI only)

1. Implement EPC card:
   - Display rating (A-G badge)
   - Show score, costs, recommendations
   - Link to full EPC certificate
   - Loading and error states

2. Implement Flood card:
   - Display risk level with color coding
   - Show mitigation advice
   - Link to Environment Agency maps

3. Implement Crime card:
   - Display crime statistics by category
   - Show comparison to national average
   - Display trends if available

4. Implement Title card:
   - Display title number
   - Show tenure type
   - Display price history chart (if available)

### Dependencies & Ordering

- **Task 4.1** (api_cache table) must complete first
- **Tasks 4.2-4.5** (Edge Functions) can run in parallel
- **Task 4.6** (hooks) can start after first Edge Function is deployed
- **Task 4.7** (UI components) depends on hooks

**Unlocks:**

- Phase 5 (advanced features) can use API data
- Phase 6 (admin) can show API usage analytics

### Testing & Validation Plan

1. **Edge Function Tests:**
   - Test each Edge Function with valid/invalid inputs
   - Verify caching behavior
   - Test error handling and rate limiting
   - Verify CORS headers

2. **Cache Tests:**
   - Verify cache hit on second request
   - Verify cache expiry
   - Test cache invalidation

3. **Frontend Tests:**
   - Test hooks with mock data
   - Test UI components with loading/error states
   - Test API data display on property pages

4. **Integration Tests:**
   - End-to-end: property page loads API data
   - Verify data appears correctly in UI cards

### Performance & Security Considerations

- **Performance:** Cache API responses to reduce external calls
- **Security:** API keys stored in Edge Function secrets (never exposed to client)
- **Rate Limiting:** Implement per-IP rate limiting in Edge Functions
- **Error Handling:** Graceful degradation if APIs fail

### Acceptance Criteria & Metrics

- ✅ EPC data displays on property pages with <2s load time
- ✅ Flood risk data displays with risk levels and mitigation
- ✅ Crime statistics display with category breakdown
- ✅ HMLR title data available for properties with title numbers
- ✅ All API calls cached with appropriate TTLs
- ✅ API cache hit rate >70% for repeated requests
- ✅ Edge Functions handle errors gracefully (no 500s for invalid inputs)

### Nice-to-Haves

- Add Planning API integration (local authority planning applications)
- Add real-time API data refresh triggers
- Add API usage analytics dashboard
- Add webhook support for API data updates

---

## Phase 5 – Advanced User-Facing Features

### Goal & Definition of Done

Implement commercially valuable features: property flags, watchlist, property comparison, and report generation. Success means: users can flag property issues, save properties to watchlist, compare multiple properties side-by-side, and generate PDF reports for properties.

**Definition of Done:**

- [ ] Property flags system implemented (DB schema, RLS, UI)
- [ ] Watchlist functionality (add/remove, view watchlist, alerts)
- [ ] Property comparison page (side-by-side view)
- [ ] Report generation (PDF export with property data)
- [ ] All features have RLS policies
- [ ] All features have UI components

### Scope – In / Out

**In Scope:**

- Property flags table and UI
- Watchlist table and UI
- Property comparison page
- PDF report generation
- Related RPCs and server actions

**Out of Scope:**

- Admin UI (Phase 6)
- External API integrations (Phase 4)
- Real-time notifications (can be added later)

### Concrete Tasks / Work Items

#### Task 5.1: Property Flags System

**Files:** New migration `20250326000000_property_flags.sql`, `frontend/components/property/property-flags.tsx` (update stub), `frontend/actions/property-flags.ts` (to create)

**Difficulty:** M

**Risk:** Medium (new feature)

1. Create property_flags table (if not exists):
   ```sql
   CREATE TABLE IF NOT EXISTS public.property_flags (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
     created_by_user_id UUID NOT NULL REFERENCES public.users(id),
     flag_type TEXT NOT NULL CHECK (flag_type IN ('data_quality', 'risk', 'compliance', 'ownership', 'document', 'other')),
     severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
     status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
     description TEXT,
     resolved_at TIMESTAMPTZ,
     resolved_by_user_id UUID REFERENCES public.users(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     deleted_at TIMESTAMPTZ
   );
   
   CREATE INDEX idx_property_flags_property_status
   ON public.property_flags(property_id, status, severity)
   WHERE deleted_at IS NULL;
   ```

2. Add RLS policies:
   ```sql
   ALTER TABLE public.property_flags ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "property_flags_select"
   ON public.property_flags FOR SELECT
   TO authenticated
   USING (
     public.can_view_property(property_id)
     AND deleted_at IS NULL
   );
   
   CREATE POLICY "property_flags_insert"
   ON public.property_flags FOR INSERT
   TO authenticated
   WITH CHECK (
     public.can_view_property(property_id)
   );
   
   CREATE POLICY "property_flags_update"
   ON public.property_flags FOR UPDATE
   TO authenticated
   USING (
     public.can_edit_property(property_id)
     OR created_by_user_id = auth.uid()
   );
   ```

3. Implement UI component:
   - Flag creation dialog
   - Flag list with filtering
   - Flag resolution workflow
   - Severity badges

#### Task 5.2: Watchlist Functionality

**Files:** New migration `20250327000000_watchlist.sql`, `frontend/app/(app)/watchlist/page.tsx` (to create), `frontend/actions/watchlist.ts` (to create)

**Difficulty:** M

**Risk:** Low (additive feature)

1. Create watchlist table:
   ```sql
   CREATE TABLE IF NOT EXISTS public.watchlist (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
     property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
     notes TEXT,
     alert_on_changes BOOLEAN NOT NULL DEFAULT true,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(user_id, property_id)
   );
   
   CREATE INDEX idx_watchlist_user
   ON public.watchlist(user_id, created_at DESC);
   ```

2. Add RLS policies:
   ```sql
   ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "watchlist_select"
   ON public.watchlist FOR SELECT
   TO authenticated
   USING (user_id = auth.uid());
   
   CREATE POLICY "watchlist_insert"
   ON public.watchlist FOR INSERT
   TO authenticated
   WITH CHECK (user_id = auth.uid());
   
   CREATE POLICY "watchlist_delete"
   ON public.watchlist FOR DELETE
   TO authenticated
   USING (user_id = auth.uid());
   ```

3. Implement UI:
   - Add to watchlist button on property pages
   - Watchlist page with saved properties
   - Remove from watchlist action
   - Notes field per property

#### Task 5.3: Property Comparison

**Files:** `frontend/app/(app)/properties/compare/page.tsx` (to create), `frontend/components/property/property-comparison.tsx` (to create)

**Difficulty:** L

**Risk:** Low (read-only feature)

1. Design comparison page:
   - URL structure: `/properties/compare?id1=...&id2=...&id3=...`
   - Side-by-side table layout
   - Compare: address, UPRN, status, completion %, documents count, media count, EPC rating, flood risk

2. Implement comparison component:
   - Fetch multiple properties in parallel
   - Display comparison table
   - Highlight differences
   - Export comparison as CSV

#### Task 5.4: Report Generation

**Files:** `frontend/actions/generate-property-report.ts` (to create), new Edge Function `supabase/functions/generate-report/index.ts`

**Difficulty:** XL

**Risk:** Medium (complex feature)

1. Design report structure:
   - Property overview (address, UPRN, status)
   - Key facts (completion %, stakeholders)
   - Documents list
   - Media gallery (thumbnails)
   - API data summary (EPC, flood, crime)
   - Tasks and flags
   - Timeline of events

2. Implement PDF generation:
   - Option A: Server-side with library (e.g., `pdfkit`, `puppeteer`)
   - Option B: Client-side with `jsPDF` (simpler, but limited)
   - **Recommendation:** Edge Function with `puppeteer` for HTML-to-PDF

3. Create Edge Function:
   ```typescript
   // supabase/functions/generate-report/index.ts
   // Fetch property data, render HTML template, convert to PDF
   ```

4. Add download action:
   - Server action triggers Edge Function
   - Returns PDF blob
   - Client downloads file

### Dependencies & Ordering

- **Task 5.1** (flags) is independent
- **Task 5.2** (watchlist) is independent
- **Task 5.3** (comparison) depends on property data (can use existing)
- **Task 5.4** (reports) can use API data from Phase 4

**Unlocks:**

- Phase 6 (admin) can show flags/watchlist analytics

### Testing & Validation Plan

1. **Flags Tests:**
   - Test flag creation (owner, viewer, editor)
   - Test flag resolution (only owners)
   - Test flag filtering

2. **Watchlist Tests:**
   - Test add/remove from watchlist
   - Test watchlist page loads
   - Test notes functionality

3. **Comparison Tests:**
   - Test comparison with 2-3 properties
   - Test comparison with missing data
   - Test CSV export

4. **Report Tests:**
   - Test PDF generation
   - Test report includes all sections
   - Test report download

### Performance & Security Considerations

- **Performance:** Comparison page should load <2s with 3 properties
- **Security:** Reports should respect RLS (only accessible properties)
- **Storage:** Reports could be cached in storage bucket (optional)

### Acceptance Criteria & Metrics

- ✅ Users can create flags on properties they can view
- ✅ Users can add properties to watchlist
- ✅ Users can compare 2-5 properties side-by-side
- ✅ Users can generate PDF reports for accessible properties
- ✅ All features respect RLS policies
- ✅ Report generation completes in <10s

### Nice-to-Haves

- Email alerts for watchlist changes
- Flag templates for common issues
- Comparison saved as report
- Scheduled report generation

---

## Phase 6 – Admin, Analytics & Operational Readiness

### Goal & Definition of Done

Build operational tooling for administrators: dashboard with system KPIs, user management UI, system analytics, and audit log viewer. Success means: admins can view system health, manage users, see analytics, and audit all actions.

**Definition of Done:**

- [ ] Admin dashboard with system KPIs
- [ ] User management UI (view, deactivate, view roles)
- [ ] System analytics (properties, users, documents, API usage)
- [ ] Audit log viewer with filters
- [ ] All admin routes protected (admin-only access)
- [ ] RLS policies for admin tables

### Scope – In / Out

**In Scope:**

- Admin dashboard page
- User management UI
- Analytics queries and charts
- Audit log viewer
- Admin route protection

**Out of Scope:**

- Advanced admin features (can be added later)
- Automated admin actions (can be added later)

### Concrete Tasks / Work Items

#### Task 6.1: Admin Dashboard

**Files:** `frontend/app/(app)/admin/page.tsx` (to create), `frontend/components/admin/admin-dashboard.tsx` (to create)

**Difficulty:** M

**Risk:** Low (read-only)

1. Create admin dashboard RPC:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
   RETURNS JSONB
   LANGUAGE sql
   SECURITY DEFINER
   AS $
     SELECT jsonb_build_object(
       'total_properties', (SELECT COUNT(*) FROM public.properties WHERE deleted_at IS NULL),
       'active_properties', (SELECT COUNT(*) FROM public.properties WHERE status = 'active' AND deleted_at IS NULL),
       'total_users', (SELECT COUNT(*) FROM public.users),
       'total_documents', (SELECT COUNT(*) FROM public.documents WHERE deleted_at IS NULL),
       'total_media', (SELECT COUNT(*) FROM public.media WHERE deleted_at IS NULL),
       'api_cache_entries', (SELECT COUNT(*) FROM public.api_cache),
       'open_flags', (SELECT COUNT(*) FROM public.property_flags WHERE status = 'open' AND deleted_at IS NULL)
     );
   $;
   ```

2. Implement dashboard UI:
   - KPI cards (properties, users, documents, media)
   - Charts (properties over time, user growth)
   - Recent activity feed
   - System health indicators

3. Add admin route protection:
   - Create `frontend/components/admin/AdminRouteGuard.tsx`
   - Check `users.primary_role = 'admin'`
   - Redirect non-admins

#### Task 6.2: User Management UI

**Files:** `frontend/app/(app)/admin/users/page.tsx` (to create), `frontend/components/admin/user-management.tsx` (to create)

**Difficulty:** L

**Risk:** Medium (user data access)

1. Create user list RPC:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_admin_users(
     limit_count INT DEFAULT 50,
     offset_count INT DEFAULT 0
   )
   RETURNS TABLE (
     id UUID,
     email TEXT,
     full_name TEXT,
     primary_role TEXT,
     created_at TIMESTAMPTZ,
     properties_count BIGINT
   )
   LANGUAGE sql
   SECURITY DEFINER
   AS $
     SELECT
       u.id,
       u.email,
       u.full_name,
       u.primary_role,
       u.created_at,
       COUNT(DISTINCT ps.property_id) as properties_count
     FROM public.users u
     LEFT JOIN public.property_stakeholders ps ON ps.user_id = u.id AND ps.deleted_at IS NULL
     GROUP BY u.id, u.email, u.full_name, u.primary_role, u.created_at
     ORDER BY u.created_at DESC
     LIMIT limit_count
     OFFSET offset_count;
   $;
   ```

2. Implement user management UI:
   - User list with pagination
   - User detail view (roles, properties, activity)
   - Deactivate user action
   - View user's property access

#### Task 6.3: System Analytics

**Files:** `frontend/app/(app)/admin/analytics/page.tsx` (to create), `frontend/components/admin/analytics-charts.tsx` (to create)

**Difficulty:** L

**Risk:** Low (read-only)

1. Create analytics RPCs:
   - Properties over time
   - User growth
   - Document uploads over time
   - API usage by provider
   - Task completion rates

2. Implement charts:
   - Use `recharts` library (already in dependencies)
   - Line charts for trends
   - Bar charts for comparisons
   - Pie charts for distributions

#### Task 6.4: Audit Log Viewer

**Files:** `frontend/app/(app)/admin/audit/page.tsx` (to create), `frontend/components/admin/audit-log-viewer.tsx` (to create)

**Difficulty:** M

**Risk:** Low (read-only)

1. Create audit log query RPC:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_audit_logs(
     p_limit INT DEFAULT 100,
     p_offset INT DEFAULT 0,
     p_user_id UUID DEFAULT NULL,
     p_resource_type TEXT DEFAULT NULL,
     p_action TEXT DEFAULT NULL
   )
   RETURNS TABLE (
     id UUID,
     actor_user_id UUID,
     action TEXT,
     resource_type TEXT,
     resource_id UUID,
     created_at TIMESTAMPTZ,
     metadata JSONB
   )
   LANGUAGE sql
   SECURITY DEFINER
   AS $
     SELECT
       al.id,
       al.actor_user_id,
       al.action,
       al.resource_type,
       al.resource_id,
       al.created_at,
       al.metadata
     FROM public.activity_log al
     WHERE
       (p_user_id IS NULL OR al.actor_user_id = p_user_id)
       AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
       AND (p_action IS NULL OR al.action = p_action)
     ORDER BY al.created_at DESC
     LIMIT p_limit
     OFFSET p_offset;
   $;
   ```

2. Implement audit log viewer:
   - Filterable table (user, resource type, action, date range)
   - Export to CSV
   - Detail view for each log entry

### Dependencies & Ordering

- **Task 6.1** (dashboard) can start first
- **Task 6.2** (users) is independent
- **Task 6.3** (analytics) can use data from existing tables
- **Task 6.4** (audit) depends on `activity_log` table (should exist)

**Unlocks:**

- Production deployment readiness

### Testing & Validation Plan

1. **Admin Access Tests:**
   - Verify non-admins cannot access admin routes
   - Verify admins can access all admin features

2. **Dashboard Tests:**
   - Verify KPIs load correctly
   - Verify charts render
   - Test with empty data

3. **User Management Tests:**
   - Test user list pagination
   - Test user deactivation
   - Test user detail view

4. **Analytics Tests:**
   - Verify charts render with data
   - Test date range filters

5. **Audit Log Tests:**
   - Test filtering
   - Test CSV export
   - Verify log entries are accurate

### Performance & Security Considerations

- **Performance:** Admin dashboard should load <2s
- **Security:** All admin routes must check `is_admin()`
- **Data Privacy:** Audit logs should not expose sensitive data in UI

### Acceptance Criteria & Metrics

- ✅ Admin dashboard displays system KPIs
- ✅ User management UI allows viewing and deactivating users
- ✅ Analytics show trends and distributions
- ✅ Audit log viewer allows filtering and export
- ✅ All admin routes protected (non-admins redirected)
- ✅ Admin features load in <2s

### Nice-to-Haves

- Admin user activity monitoring
- Automated alerts for system issues
- Admin action logging
- System health monitoring dashboard

---

## Critical Path & Parallelisation Summary

### Critical Path (Sequential Dependencies)

**Must Complete in Order:**

1. **Phase 1** → **Phase 2** → **Phase 3** → **Phase 4** → **Phase 5** → **Phase 6**
   - Phase 1 (hygiene) must complete before any other work (build issues block everything)
   - Phase 2 (performance) should complete before Phase 3 (tests benefit from optimizations)
   - Phase 3 (testing) should complete before Phase 4+ (regression prevention)
   - Phase 4 (APIs) can inform Phase 5 (reports use API data)
   - Phase 5 (features) can inform Phase 6 (admin analytics)

**Within Each Phase:**

- **Phase 1:** Tasks 1.1-1.5 can mostly run in parallel (except 1.2 blocks CI/CD)
- **Phase 2:** Task 2.1 (indexes) should complete first, then 2.2-2.5 can run in parallel
- **Phase 3:** Tasks 3.1-3.3 can run in parallel
- **Phase 4:** Task 4.1 (cache table) must complete first, then 4.2-4.5 can run in parallel, then 4.6-4.7
- **Phase 5:** Tasks 5.1-5.3 can run in parallel, Task 5.4 (reports) is independent
- **Phase 6:** Tasks 6.1-6.4 can run in parallel

### Parallelisation Opportunities

**Can Run in Parallel Across Phases:**

- Phase 2 (performance) + Phase 3 (testing) preparation (test infrastructure setup)
- Phase 4 (APIs) + Phase 5 (features) - after Phase 3 completes
- Phase 5 (features) + Phase 6 (admin) - after core features stable

**Team Allocation (1-3 Engineers):**

- **1 Engineer:** Follow critical path sequentially (8-12 weeks)
- **2 Engineers:** 
  - Engineer 1: Phase 1 → Phase 2 → Phase 3
  - Engineer 2: Phase 1 → Phase 4 (after Phase 1) → Phase 5 (after Phase 3)
  - Then both: Phase 6 (6-8 weeks)
- **3 Engineers:**
  - Engineer 1: Phase 1 → Phase 2 → Phase 3
  - Engineer 2: Phase 1 → Phase 4 → Phase 5
  - Engineer 3: Phase 1 → Phase 6 (can start after Phase 1)
  - (4-6 weeks)

### Recommended Real-World Sequence

**Week 1-2: Phase 1 (Hygiene)**
- All engineers work on Phase 1 tasks in parallel
- Critical: Complete storage policies and seed alignment

**Week 3-4: Phase 2 (Performance) + Phase 3 Prep**
- Engineer 1: Phase 2 (indexes, batching, pagination)
- Engineer 2: Phase 2 (FTS, caching)
- Engineer 3: Phase 3 test infrastructure setup

**Week 5-6: Phase 3 (Testing)**
- All engineers: Expand test coverage
- Critical: RLS tests, server action tests, E2E tests

**Week 7-8: Phase 4 (External APIs)**
- Engineer 1: EPC + HMLR Edge Functions
- Engineer 2: Flood + Crime Edge Functions
- Engineer 3: Frontend hooks + UI components

**Week 9-10: Phase 5 (Advanced Features)**
- Engineer 1: Flags + Watchlist
- Engineer 2: Comparison + Reports

**Week 11-12: Phase 6 (Admin) + Polish**
- All engineers: Admin features, final testing, documentation

### Risk Mitigation

**High-Risk Items (Monitor Closely):**

- Phase 1 Task 1.4 (storage policies) - test thoroughly
- Phase 4 (external APIs) - API availability, rate limits
- Phase 5 Task 5.4 (reports) - complex PDF generation

**Mitigation Strategies:**

- Storage policies: Extensive manual testing before deployment
- External APIs: Implement robust error handling and caching
- PDF reports: Start with simple HTML-to-PDF, iterate

### Success Metrics

**Overall Project Success:**

- ✅ All phases complete within 12 weeks
- ✅ Zero critical bugs in production
- ✅ Test coverage >60% for critical paths
- ✅ Dashboard load time <800ms
- ✅ All admin features functional
- ✅ External API integrations working

---

**End of Roadmap**

This roadmap provides a comprehensive, implementation-ready plan for completing Property Passport UK v7.0 from ~70% to production-ready MVP. Each phase is designed to be independently shippable, with clear acceptance criteria and testing plans.