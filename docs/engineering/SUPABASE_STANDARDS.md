PROPERTY PASSPORT UK v7 — SUPABASE STANDARDS

Version: 1.0

Audience: Backend engineers, AI agents

Scope: All database, RLS, RPC, migrations, storage, and performance rules.

1. Supabase Philosophy for PPUK

PPUK treats Supabase not as a simple backend, but as the authoritative security layer.

Supabase is responsible for:

Property-scoped access control

Authentication

Role assignment

Query performance

Data integrity

Secure document/media storage

Public passport exposure

External API caching

Logging & auditing

Everything in the Next.js app must conform to these rules, not bypass them.

2. Database Schema Standards

2.1 Naming Conventions

Tables → snake_case

Columns → snake_case

Functions → lowercase_no_spaces

Enums → lowercase_enum

Indexes → table_column_idx

Policies → table_policyname_policy

Example:

properties

property_stakeholders

property_stakeholders_user_id_idx

can_view_property(stakeholder_user_id uuid, property_id uuid)

2.2 Soft Delete Everywhere

Every mutable table must include:

deleted_at TIMESTAMPTZ DEFAULT NULL

Never hard delete user data.

RLS must block access to deleted items.

2.3 Required Timestamps

Every table must include:

created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

Triggers should update updated_at.

2.4 Required Foreign Key Pattern

ALWAYS:

ON DELETE CASCADE

ON UPDATE CASCADE

PPUK assumes referential integrity everywhere.

3. Enum Definitions

Global roles:

user_primary_role ENUM ('consumer', 'agent', 'conveyancer', 'surveyor', 'admin')

Stakeholder status:

property_status_type ENUM ('owner', 'buyer', 'tenant')

Stakeholder permission:

property_permission_type ENUM ('viewer', 'editor')

Document type examples:

document_type ENUM ('epc', 'warranty', 'manual', 'compliance', 'report', 'lease', 'certificate', 'other')

Enums MUST be included in migrations with clear documentation.

4. RLS Architecture

PPUK enforces a zero-trust model, meaning:

No table is accessible without explicit RLS policy

All SELECT, INSERT, UPDATE, DELETE paths must be secured

Admin bypass is controlled ONLY via is_admin()

4.1 Helper Functions (Mandatory)

All helper functions must exist:

is_admin()

is_authenticated()

is_property_stakeholder(user_id uuid, property_id uuid)

stakeholder_permission(user_id uuid, property_id uuid)

stakeholder_status(user_id uuid, property_id uuid)

can_view_property(user_id uuid, property_id uuid)

can_edit_property(user_id uuid, property_id uuid)

can_view_document(...)

can_edit_document(...)

can_upload_media(...)

These functions MUST be:

STABLE

RLS-safe

Pure SQL (no PL/pgSQL unless necessary)

Bound to schema public

4.2 Policy Templates

SELECT (read)

USING (

  is_admin() OR

  can_view_property(auth.uid(), property_id)

)

INSERT (write)

WITH CHECK (

  is_admin() OR

  can_edit_property(auth.uid(), property_id)

)

UPDATE

USING (

  is_admin() OR

  can_edit_property(auth.uid(), property_id)

)

DELETE (soft delete only)

Deletes MUST modify deleted_at.

5. RPC Standards

RPCs are used for:

batch operations

complex reads

permission-compound logic

public passport exposure

dashboard metrics

5.1 RPC Naming Conventions

get_* → read

update_* → write

search_* → search logic

create_property_with_role

set_public_visibility

5.2 RPC Requirements

Every RPC MUST:

include argument and return type definitions

validate roles internally

call RLS-safe helper functions

avoid leaking unauthorized data

log changes into property_events

Example structure:

CREATE OR REPLACE FUNCTION get_user_properties(p_user uuid)

RETURNS SETOF properties AS $$

  SELECT *

  FROM properties

  WHERE can_view_property(p_user, id)

  AND deleted_at IS NULL;

$$ LANGUAGE SQL STABLE;

6. Storage Standards (Critical)

Two buckets:

property-documents

property-media

6.1 RLS for Storage

Policies MUST enforce:

Only editors can upload

Only viewers/editors can read

Public passports must use signed URLs

Admins always bypass

No file should ever be public.

7. Performance Standards

Mandatory:

INDEX all foreign key columns

Use partial indexes for filtered tables

Use FTS for search

Batch RPCs for dashboard queries

NEVER generate signed URLs client-side

Always cache signed URLs

8. Migration Standards

Required structure:

-- YYYY-MM-DD: Purpose of migration

BEGIN;

-- enums

-- tables

-- columns

-- indexes

-- policies

-- helper functions

COMMIT;

Rules:

Never modify existing enums → always extend

Never drop tables without extreme justification

All migrations must be reversible

Always test migrations against local Supabase

Migrations must be idempotent

✔ END — SUPABASE STANDARDS

