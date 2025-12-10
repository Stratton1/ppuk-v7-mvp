PROPERTY PASSPORT UK v7 — PERFORMANCE GUIDELINES

Version: 1.0

Audience: Backend, Frontend, DevOps, AI Agents

Scope: Performance standards for database, RPCs, server actions, caching, and frontend rendering.

1. Performance Philosophy

Property Passport UK is a data-intensive, security-critical platform where:

Users frequently browse multiple properties

Each property contains nested: documents, media, tasks, stakeholders, flags

RLS must be evaluated on every query

Browser rendering must remain smooth

Supabase storage must avoid latency spikes

PPUK must maintain sub-150ms perceived loads across all critical screens.

Performance is not optional — it is core.

2. Database-Level Performance Requirements

Supabase/Postgres is the backbone of PPUK. Efficient querying is essential.

2.1 Required Indexing

For every table:

Foreign keys must have indexes:

properties.owner_id_idx

documents.property_id_idx

media.property_id_idx

property_stakeholders.user_id_idx

tasks.property_id_idx

Partial indexes for soft deletes:

CREATE INDEX documents_not_deleted_idx

  ON documents(property_id)

  WHERE deleted_at IS NULL;

Partial indexes for invitations:

CREATE INDEX invitations_active_idx 

  ON invitations(email)

  WHERE accepted_at IS NULL AND deleted_at IS NULL;

FTS index for property search:

CREATE INDEX property_search_idx 

  ON properties USING GIN (to_tsvector('english', address || ' ' || postcode));

2.2 Avoiding N+1 Queries

NEVER run repeated Supabase .select() queries within loops.

Instead:

Use batch RPCs

Use Supabase joins

Prefetch related data on the server

Use React Query batching for client components

2.3 RPCs Must Be STABLE (when possible)

Queries that do not mutate state must use:

LANGUAGE SQL STABLE

This improves performance and caching on the Postgres planner.

3. Server Action Performance Standards

3.1 Reduce network round-trips

Server actions should:

Combine multiple Supabase queries where possible

Use RPCs for heavy operations

Avoid reading unneeded columns

Use select with explicit column lists

3.2 Signed URL Performance

Signed URLs must:

ALWAYS be generated server-side

ALWAYS be cached (1-hour TTL) in signed-url-cache.ts

NEVER be requested concurrently

Batch signed URLs via:

supabase.storage.from('property-media').createSignedUrls(...)

3.3 File Upload Performance

Rules:

Chunk uploads >= 5MB

Ensure MIME type validation before upload

Use server actions, not client Supabase

4. Frontend Performance

4.1 Server Components First

All non-interactive data fetching must be done in Server Components:

reduces JS bundle size

improves TTFB

ensures stable caching

4.2 React Query for Interactive Widgets

Client components that fetch additional data must:

use React Query (never raw useEffect(fetch))

define stable queryKey values

set appropriate caching times

4.3 Pagination Everywhere

Property lists, document lists, event logs, and tasks must:

use cursor-based pagination

never fetch more than 50 items at once

4.4 Avoid Large Objects in React State

Forbidden:

Storing full property objects in component state

Caching Supabase responses in long-lived providers

Use minimal state & derive everything else.

5. Public Passport Performance

The public passport must render in under 100ms TTFB.

Rules:

Pre-generate slugs

Cache property metadata

Serve lightweight views

Avoid loading documents or media directly

Rely on signed URLs for access

6. External API Integration Performance

All external API functions (EPC, HMLR, Flood, Crime) must:

Be cached in api_cache

Have a max freshness window

Use a source field indicating where data came from

Gracefully degrade if API is unreachable

Not block UI rendering

Include timestamps for cache validation

Avoid re-fetching identical properties

7. Performance Budgets

Page Load Budgets

Page	Target Load Time	Notes

Dashboard	< 200ms	Batched RPC required

Property Details	< 250ms	Signed URL caching mandatory

Public Passport	< 100ms	Static rendering patterns

Tasks	< 150ms	Client batching

Documents	< 200ms	Signed URL batch fetch

8. Monitoring Performance

Engineers must:

Use Supabase query logs

Use Vercel Analytics

Use Lighthouse CI

Monitor Core Web Vitals

AI agents must:

Avoid generating unindexed queries

Suggest indexes when queries are slow

Suggest batching or caching strategies where needed

✔ END — PERFORMANCE GUIDELINES

