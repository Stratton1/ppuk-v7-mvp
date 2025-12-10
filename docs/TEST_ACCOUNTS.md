# ==========================================================
# Property Passport UK - Test Accounts (Local Dev Only)
# ==========================================================

This file documents all seeded users for local development and testing.
These accounts must NEVER be used in staging or production.

Passwords DO NOT have trailing spaces.

-------------------------------------------------------------
## 1. CORE SEEDED USERS
-------------------------------------------------------------

### Owner
- Email: owner@test.local
- Password: Test123!
- Primary Role: consumer
- Property Status: owner
- Permission: editor
- Purpose: full flows, document upload, editing, dashboard

### Buyer
- Email: buyer@test.local
- Password: Test123!
- Primary Role: consumer
- Property Status: buyer
- Permission: viewer
- Purpose: fall-through testing, limited access flows

### Tenant
- Email: tenant@test.local
- Password: Test123!
- Primary Role: consumer
- Property Status: tenant
- Permission: viewer

### Agent / Editor
- Email: agent@test.local
- Password: Test123!
- Primary Role: agent
- Gains editor permission after invitation
- Purpose: access control and agent workflows

### Conveyancer
- Email: conveyancer@test.local
- Password: Test123!
- Primary Role: conveyancer
- Editor after invite
- Purpose: legal handover flows

### Surveyor
- Email: surveyor@test.local
- Password: Test123!
- Primary Role: surveyor

### Admin
- Email: admin@test.local
- Password: Admin123!
- Primary Role: admin
- Full access to admin panel

-------------------------------------------------------------
## 2. HOW TO RESEED TEST USERS
-------------------------------------------------------------

Use Supabase CLI:

supabase auth admin createuser \
  --email owner@test.local \
  --password "Test123!" \
  --email-confirm

Then insert corresponding rows into `public.users` with the correct primary_role.

-------------------------------------------------------------
## 3. TEST LOGIN PANEL
-------------------------------------------------------------

The route /test/login includes one-click login buttons for:

- Owner
- Buyer
- Tenant
- Agent
- Conveyancer
- Surveyor
- Admin

Playwright uses these when:
- direct Supabase login fails OR
- PLAYWRIGHT_TEST=true
- ?test-login=1 is present

-------------------------------------------------------------
DO NOT USE THESE ACCOUNTS OUTSIDE LOCAL DEV.
-------------------------------------------------------------
