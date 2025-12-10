This is the canonical architecture specification for Property Passport UK v7.

It sets the foundation for all other engineering documentation.

🧱 PROPERTY PASSPORT UK v7 — ARCHITECTURE SPECIFICATION

Version: 1.0

Maintainers: CTO & Engineering Leads

Audience: Engineering Team, AI Agents, Technical Partners

Scope: Full-system architecture including frontend, backend, RLS, testing, and integrations.

1. High-Level Overview

Property Passport UK v7 (PPUK v7) is a security-critical, data-rich, multi-role web application built on:

Frontend

Next.js 16 (App Router)

React 19

TypeScript strict mode

Server Components first–architecture

Shadcn/UI design system

React Query for client async state

Backend

Supabase (PostgreSQL + RLS + Auth + Storage)

RPC functions for complex operations

Row-Level Security (RLS) for property-scoped access

Database migrations define state evolution

Middleware & Edge

Supabase Edge Functions for external API integrations

Next.js server actions for secure server-side mutations

Testing

Vitest for unit & integration tests

Database-backed RLS tests

Playwright for E2E

Test MCP Agents (self-correcting UI workflows)

Deterministic /api/test/reset route

Dev Environments

Local Supabase (Docker)

.env.local + .env.test.local

Test users (owner, buyer, tenant, agent, conveyancer, surveyor, admin)

2. Domain Model

2.1 Entities

Property

Represents a single residential dwelling.

Fields include:

ID

UPRN

Address

Slug (for public passport)

Metadata

Status

Visibility settings

User

Supabase Auth identity + custom profile.

Stakeholder

Links users to properties.

Each stakeholder has:

status: owner, buyer, tenant

permission: viewer, editor

timestamps

invitation state

Documents

Files uploaded for a property (EPC, warranties, compliance, reports, legal docs…).

Media

Photos & videos.

Tasks

Checklist, reminders, issue tracking.

Property Events

Immutable event log for all actions.

Property Flags

Alerts, issues, outstanding items.

Watchlist

User tracking of properties.

API Cache

Stores fetched external API data.

2.2 Global Roles (User-Level)

consumer

agent

conveyancer

surveyor

admin

Global roles determine default capabilities, but never override RLS.

2.3 Property Roles (Stakeholder-Level)

owner (editor)

buyer (viewer)

tenant (viewer)

Permissions derived:

viewer

editor

3. Security Architecture

PPUK v7 is designed around zero-trust, property-scoped RLS.

Core controlled access layers:

Supabase Auth

RLS policies (property-scoped)

RPC with SECURITY DEFINER

Next.js server actions enforcing permission logic

Client UI preventing invalid interaction states

Every read/write operation must satisfy:

Correct user

Correct role

Correct property relationship

No deleted state

Access not expired

Admin bypass only via is_admin()

4. Database Architecture

The database follows:

Strict normalization

Soft delete for all mutable entities (deleted_at)

Time series logging (property_events)

Cache tables for external APIs

Partial indexes for filtered queries

Deterministic migrations

Key tables:

properties

property_stakeholders

documents

media

tasks

property_events

property_metadata

invitations

notifications

activity_log

api_cache

property_flags

watchlist

5. Backend Logic: RPCs & Server Actions

Backend logic lives in two places:

5.1 Supabase RPC Functions

Used for:

Searching

Batch operations

Role assignment

Property creation

Event logging

Dashboard metrics

Public passport lookups

Performance-critical queries

Key properties:

SECURITY DEFINER

Bound to specific SCHEMA rules

RLS-aware

Use helper functions

5.2 Next.js Server Actions

Used for:

Uploading documents & media

Editing property

Deleting items

Toggling visibility

Managing flags & watchlists

Client-triggered mutations

Server actions validate:

Authentication

Permissions

Input formats

Error safe return shape

6. Frontend Architecture

6.1 App Structure

app/

  (public)/

  (app)/

  admin/

  test/

(public)

marketing

signup/login

public passport (/p/[slug])

public search

(app)

dashboard

properties

documents

tasks

events

stakeholders

profile settings

admin

admin-only dashboard

user management

system metrics

test

/test/login

Special test-only utilities

6.2 Component Structure

components/

  app/

  admin/

  property/

  dashboard/

  public-passport/

  ui/

  layout/

Rules:

Server components unless client interaction is required

UI primitives come from Shadcn UI

Use domain-specific components for property features

Deterministic data-testid naming

7. Performance Architecture

Rules:

Never create N+1 queries

Use batch RPCs

Cache signed URLs

Use FTS for search

Use partial indexes

Pagination required for large lists

Use React Query for async client state

8. Testing Architecture

8.1 RLS Testing

Located in:

frontend/tests/rls/*

Covers:

owner

buyer

tenant

editor

viewer

admin

8.2 Integration (Server Actions)

Located in:

frontend/tests/integration/*

Test:

success

failure

permission-denied

8.3 E2E (Playwright)

Located in:

frontend/tests/e2e/*

Rules:

Reset database

Login through /test/login

Use stable selectors

Validate UI state changes

9. DevOps & Deployment

Local development:

Docker-based Supabase

.env.local autoload

Test users loaded via script

Next.js hot reload

Deployment:

Vercel for frontend

Supabase hosted project for production

GitHub Actions (optional)

10. Domain Language (Critical for AI and Engineers)

Words to ALWAYS use consistently:

Property Passport

Stakeholder

Viewer / Editor permissions

Owner / Buyer / Tenant

Document (never "file")

Media (photos & videos)

Task

Event

Flag

Watchlist

Public passport

Visibility

Completion score

✔ END — ARCHITECTURE SPECIFICATION

