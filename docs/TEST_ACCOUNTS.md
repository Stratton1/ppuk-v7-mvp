# Test Accounts (Local Dev Only)

## Seeded Users (from supabase/seed.sql)
- **owner**: alice.owner@ppuk.test  
  - User ID: 11111111-1111-1111-1111-111111111111  
  - Role: primary_role = owner; stakeholder owner on property `aaaaaaa1-...` and `aaaaaaa2-...`  
  - Password hash in seed corresponds to plaintext `TestPassword123!` (for local dev only).
- **agent/editor**: robert.agent@ppuk.test  
  - User ID: 22222222-2222-2222-2222-222222222222  
  - Role: primary_role = viewer; stakeholder editor on property `aaaaaaa1-...`  
  - Password: `TestPassword123!` (local dev only).
- **admin**: clara.admin@ppuk.test  
  - User ID: 33333333-3333-3333-3333-333333333333  
  - Role: primary_role = admin  
  - Password: `TestPassword123!` (local dev only).

Properties seeded:
- `aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa` — 10 High Street, London (public_visibility true), owner Alice, editor Robert; media/docs/tasks/events present.
- `aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa` — 22 Baker Street, London (public_visibility false), owner Alice; media/docs/tasks/events present.

## Local Test User Seeding Plan (if reseeding)
- Suggested additional local accounts (never commit real passwords for prod):
  - buyer@test.local — role consumer/viewer; intended to accept invites.
  - conveyancer@test.local — role conveyancer; for compliance flows.
  - agent@test.local — role agent/editor; for listing flows.
- Use Supabase CLI or SQL in local project:
  - Insert auth users with `supabase auth admin createuser --email ... --password "DevTest123!" --email-confirm`.
  - Upsert corresponding rows into `public.users` with desired `primary_role`.
  - Grant stakeholder roles via `property_stakeholders` or RPC `grant_property_role`.
- Reminder: these credentials are for LOCAL DEV ONLY. Use proper invite flows and real emails in staging/production.
