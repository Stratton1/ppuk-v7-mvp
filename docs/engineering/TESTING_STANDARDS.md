PROPERTY PASSPORT UK v7 — TESTING STANDARDS

Version: 1.0

Audience: All engineers, AI agents, QA automation

Scope: RLS tests, integration tests, E2E tests, MCP agents, selectors, environment setup.

1. Testing Philosophy

PPUK requires extremely strong testing because:

RLS failures = security breaches

Server Action failures = data integrity loss

UI workflows must be deterministic

Playwright MCP self-correction requires a stable UI

Testing must provide:

Confidence

Determinism

Performance signals

Protection against regressions

2. Environment Setup

Test environment uses:

frontend/.env.test.local

Local Supabase

Docker

Test users loaded via script

Deterministic seed property (aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa)

/api/test/reset route before every test

3. Types of Tests

3.1 Unit Tests (Vitest)

Covers:

Utility functions

Data parsers

UI helpers (non-rendering)

Naming:

*.test.ts

3.2 Integration Tests (Vitest)

Covers:

Server Actions

Supabase RPC calls

Permission logic

Naming:

frontend/tests/integration/*.spec.ts

Structure:

describe('grantPropertyRole', () => {

  it('allows owner to upgrade viewer', async () => {});

  it('rejects viewer from upgrading others', async () => {});

});

3.3 RLS Tests (Vitest)

Covers every combination:

owner

buyer

tenant

editor

viewer

admin

Naming:

frontend/tests/rls/*.spec.ts

Every table must have:

Read tests

Write tests

Delete tests

Soft delete tests

Visibility tests

3.4 E2E (Playwright)

Must test:

Login flows

Dashboard rendering

Property overview

Document upload

Task creation

Flags UX

Public passport view

Admin dashboard

All tests depend on:

deterministic test login

data-testid selectors

stable UI structure

Naming:

frontend/tests/e2e/*.spec.ts

4. Selector Rules

All interactive components MUST include:

data-testid="component-action"

Examples:

data-testid="property-create-button"

data-testid="document-upload-input"

data-testid="task-complete-toggle"

Playwright MCP agents depend on these.

5. Playwright MCP Agents

The following agent capabilities must be supported:

5.1 UI Inspector Agent

Identifies broken selectors

Suggests replacements

Auto-updates test scripts

5.2 Layout Analyzer

Identifies component breakage

Suggests minimal code changes

5.3 Self-Correcting Designer

Based on the Microsoft / Playwright workflow:

Detects UI drift

Regenerates tests

Suggests CSS/layout fixes

Updates component variants

6. Test Reset API

Must exist at:

/api/test/reset

Capabilities:

Wipe property tables

Wipe document/media metadata

Re-seed the 7 test users

Insert a known property

Insert known stakeholders

All E2E tests must call this at the beginning of each test.

7. Required Test Matrix

Role	View	Edit	Upload	Delete	Visibility

Owner	✓	✓	✓	✓	✓

Buyer	✓	✗	✗	✗	✗

Tenant	✓	✗	✗	✗	✗

Agent (editor)	✓	✓	✓	✓	✓

Conveyancer	✓	✓	Limited	Limited	✓

Surveyor	✓	✗	✗	✗	✗

Admin	✓	✓	✓	✓	✓

All behaviour must be tested.

✔ END — TESTING STANDARDS

