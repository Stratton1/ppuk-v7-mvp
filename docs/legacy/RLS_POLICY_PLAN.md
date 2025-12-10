LEGACY v6 planning document; see docs/architecture/RLS_ARCHITECTURE_V7.md for the current model.
# Property Passport UK v7.0 - Row Level Security (RLS) Policy Plan
## Comprehensive Security Specification (PLANNING DOCUMENT - NO SQL)

**Version:** 1.0  
**Date:** November 27, 2025  
**Status:** PLANNING / AWAITING APPROVAL  
**Purpose:** Complete RLS policy specification before SQL generation

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Account & Identity Model](#account--identity-model)
3. [Public Data Definition](#public-data-definition)
4. [Role Model & Hierarchy](#role-model--hierarchy)
5. [Helper Functions Specification](#helper-functions-specification)
6. [Table-by-Table Policy Plan](#table-by-table-policy-plan)
   - [6.1 properties](#61-properties)
   - [6.2 property_documents](#62-property_documents)
   - [6.3 property_media](#63-property_media)
   - [6.4 users_extended](#64-users_extended)
   - [6.5 user_property_roles](#65-user_property_roles)
   - [6.6 property_events](#66-property_events)
   - [6.7 property_flags](#67-property_flags)
   - [6.8 audit_logs](#68-audit_logs)
7. [Edge Cases & Conflict Resolution](#edge-cases--conflict-resolution)
8. [Security Principles](#security-principles)
9. [Testing Requirements](#testing-requirements)
10. [Approval Checklist](#approval-checklist)

---

## EXECUTIVE SUMMARY

This document defines the complete Row Level Security policy framework for Property Passport UK v7.0. The system implements:

- **8 distinct user roles** with granular permissions
- **Public-by-default property data** (address, UPRN, location, EPC, flood, HMLR)
- **Private sensitive data** (documents, detailed owner info, financials)
- **Multi-stakeholder access** via `user_property_roles` table
- **Time-bound access** using `expires_at` field
- **Approval workflow** via `granted_by_user_id` tracking

### Key Design Principles

1. **Least Privilege**: Users see only what their role requires
2. **Defense in Depth**: Multiple checks at database level
3. **Explicit Grants**: No implicit permissions
4. **Audit Everything**: All sensitive actions logged
5. **Public First**: Property discovery doesn't require login

---

## ACCOUNT & IDENTITY MODEL

### Authentication Source
- **Supabase Auth** is the single source of truth for user identity
- Every PPUK user has a record in `auth.users`
- Extended profile data stored in `public.users_extended`
- User identity always determined by `auth.uid()`

### Identity Resolution
```
User Login → Supabase Auth → JWT with auth.uid()
             ↓
Every RLS policy checks: auth.uid() 
             ↓
Looks up roles in: user_property_roles
             ↓
Grants access based on role + property_id + expiry
```

### Session Rules
- No anonymous users (all actions require authentication except public reads)
- JWT tokens contain `auth.uid()` only
- Roles are dynamically resolved per-property via `user_property_roles`

---

## PUBLIC DATA DEFINITION

The following property information is **ALWAYS PUBLIC** and requires **NO LOGIN**:

### Public Fields (`properties` table)
- `id` (UUID)
- `uprn` (Unique Property Reference Number)
- `display_address`
- `latitude`
- `longitude`
- `status` (only if 'active')
- `created_at`
- `updated_at`

### Public Media (`property_media` table)
- Front elevation / profile photo only
- Where `media_type = 'photo'` AND `is_featured = true`

### Public External Data (API-sourced, cached in system)
- EPC certificates and ratings
- Flood risk data
- HMLR Price Paid data
- Planning history summaries
- Local authority public data
- Council tax bands
- Crime statistics (area-level)
- School catchment information

### Rationale
This data is already publicly available through government APIs and Land Registry. Making it accessible without login enables property discovery and transparency while protecting sensitive owner information.

---

## ROLE MODEL & HIERARCHY

### Role Definitions

| Role | Code | Primary Responsibilities | Typical Users |
|------|------|------------------------|---------------|
| **admin** | `admin` | Full system access, user management, override capabilities | PPUK platform administrators |
| **owner** | `owner` | Full property control, grant access, manage documents | Property owners, landlords |
| **buyer** | `buyer` | View shared properties, access approved documents | Potential purchasers, investors |
| **tenant** | `tenant` | View tenancy-relevant info, limited document access | Current tenants, renters |
| **agent** | `agent` | Manage listings, upload marketing materials, coordinate | Estate agents, letting agents |
| **conveyancer** | `conveyancer` | Access legal documents, upload certificates, manage completion | Solicitors, licensed conveyancers |
| **surveyor** | `surveyor` | Upload surveys and reports, view structural info | Property surveyors, inspectors |
| **viewer** | `viewer` | Read-only access to explicitly shared properties | Family members, advisors |

### Role Hierarchy & Capabilities

```
admin
  ↓ (can do everything any role can do)
owner
  ↓ (can grant any other role except admin)
agent / conveyancer / surveyor (professional roles)
  ↓ (can access assigned properties with specific permissions)
buyer
  ↓ (can access explicitly shared properties)
tenant / viewer (limited access roles)
```

### Multi-Role Scenarios

**A single user may have different roles across different properties:**
- User A is `owner` of Property 1
- User A is `buyer` of Property 2
- User A is `viewer` of Property 3

**Access resolution**: Check `user_property_roles` per property_id to determine role

### Time-Bound Access

All roles (except `owner` and `admin`) can have expiration:
- `granted_at`: When access was granted
- `expires_at`: When access expires (nullable)
- `deleted_at`: Soft-delete for revoked access

**Expiry Logic:**
- If `expires_at IS NULL` → access is permanent
- If `expires_at IS NOT NULL AND expires_at > NOW()` → access is valid
- If `expires_at IS NOT NULL AND expires_at <= NOW()` → access expired
- If `deleted_at IS NOT NULL` → access revoked

---

## HELPER FUNCTIONS SPECIFICATION

These SQL functions will be created to simplify RLS policy logic and ensure consistency.

### 5.1 `is_admin()`

**Purpose**: Check if current user is a system administrator

**Logic:**
```
RETURNS BOOLEAN
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_extended
    WHERE user_id = auth.uid()
    AND primary_role = 'admin'
    AND deleted_at IS NULL
  );
END
```

**Usage in policies**: Always allow admin read/write for operational overrides

---

### 5.2 `has_property_role(property_id UUID, allowed_roles TEXT[])`

**Purpose**: Check if current user has any of the specified roles for a property

**Logic:**
```
RETURNS BOOLEAN AS
PARAMETERS:
  - property_id: UUID of the property
  - allowed_roles: Array of role strings (e.g., ['owner', 'agent'])
  
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_property_roles
    WHERE user_id = auth.uid()
    AND property_id = $1
    AND role = ANY($2)
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END
```

**Usage**: Most permission checks

---

### 5.3 `is_property_owner(property_id UUID)`

**Purpose**: Specific check for ownership

**Logic:**
```
RETURNS BOOLEAN AS
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_property_roles
    WHERE user_id = auth.uid()
    AND property_id = $1
    AND role = 'owner'
    AND deleted_at IS NULL
  );
END
```

**Usage**: Operations requiring ownership (delete, grant roles, full edit)

---

### 5.4 `is_property_creator(property_id UUID)`

**Purpose**: Check if current user created the property

**Logic:**
```
RETURNS BOOLEAN AS
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM properties
    WHERE id = $1
    AND created_by_user_id = auth.uid()
  );
END
```

**Usage**: Fallback permission when no explicit role exists yet

---

### 5.5 `can_access_document(document_id UUID)`

**Purpose**: Complex document access check considering document type and user role

**Logic:**
```
RETURNS BOOLEAN AS
DECLARE
  doc_property_id UUID;
  doc_type TEXT;
  doc_status TEXT;
BEGIN
  -- Get document details
  SELECT property_id, document_type, status
  INTO doc_property_id, doc_type, doc_status
  FROM property_documents
  WHERE id = $1;
  
  -- Check if archived
  IF doc_status = 'archived' THEN
    -- Only owners and admins can see archived
    RETURN is_admin() OR is_property_owner(doc_property_id);
  END IF;
  
  -- Check role-based access
  -- Owners/admins: all documents
  IF is_admin() OR is_property_owner(doc_property_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Conveyancers: title, survey, search, identity, contract, compliance
  IF has_property_role(doc_property_id, ARRAY['conveyancer']) THEN
    RETURN doc_type IN ('title', 'survey', 'search', 'identity', 'contract', 'compliance');
  END IF;
  
  -- Surveyors: survey, planning, compliance, warranty
  IF has_property_role(doc_property_id, ARRAY['surveyor']) THEN
    RETURN doc_type IN ('survey', 'planning', 'compliance', 'warranty');
  END IF;
  
  -- Agents: survey, planning, warranty (marketing-relevant)
  IF has_property_role(doc_property_id, ARRAY['agent']) THEN
    RETURN doc_type IN ('survey', 'planning', 'warranty');
  END IF;
  
  -- Buyers: survey, planning, warranty (shared by owner)
  IF has_property_role(doc_property_id, ARRAY['buyer']) THEN
    RETURN doc_type IN ('survey', 'planning', 'warranty');
  END IF;
  
  -- Tenants: gas_safety, electrical_safety, epc
  IF has_property_role(doc_property_id, ARRAY['tenant']) THEN
    RETURN doc_type IN ('gas_safety', 'electrical_safety', 'epc');
  END IF;
  
  -- Viewers: no document access unless explicitly granted
  RETURN FALSE;
END
```

**Usage**: All document SELECT policies

---

### 5.6 `is_approved_for_property(property_id UUID)`

**Purpose**: Check if user has active, non-expired access

**Logic:**
```
RETURNS BOOLEAN AS
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_property_roles
    WHERE user_id = auth.uid()
    AND property_id = $1
    AND deleted_at IS NULL
    AND granted_by_user_id IS NOT NULL  -- Must have been granted by someone
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END
```

**Usage**: Validate approved professional access

---

### 5.7 `is_within_access_window(property_id UUID)`

**Purpose**: Check if current time is within granted access period

**Logic:**
```
RETURNS BOOLEAN AS
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_property_roles
    WHERE user_id = auth.uid()
    AND property_id = $1
    AND deleted_at IS NULL
    AND granted_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END
```

**Usage**: Time-sensitive access checks

---

### 5.8 `get_user_property_roles(property_id UUID)`

**Purpose**: Get all active roles current user has for a property

**Logic:**
```
RETURNS TEXT[] AS
BEGIN
  RETURN ARRAY(
    SELECT role FROM user_property_roles
    WHERE user_id = auth.uid()
    AND property_id = $1
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END
```

**Usage**: Display user's current access level

---

## TABLE-BY-TABLE POLICY PLAN

---

## 6.1 properties

**Table Purpose**: Core property records anchored by UPRN

**Public Fields**: `id`, `uprn`, `display_address`, `latitude`, `longitude`, `status`, `created_at`, `updated_at`

**Private Fields**: `created_by_user_id`, `deleted_at`

---

### 6.1.1 SELECT Policies

#### Policy: `properties_public_read`
**Who**: Everyone (including anonymous)  
**When**: Always  
**What**: Public fields only for active properties  
**Condition**:
```
status = 'active' AND deleted_at IS NULL
```
**Fields exposed**: Public fields only (listed above)  
**Rationale**: Property discovery and transparency

---

#### Policy: `properties_authenticated_read`
**Who**: Authenticated users  
**When**: User has any role for the property OR user created it  
**What**: All fields  
**Condition**:
```
(
  is_admin()
  OR created_by_user_id = auth.uid()
  OR is_approved_for_property(id)
)
AND deleted_at IS NULL
```
**Rationale**: Full property data for stakeholders

---

### 6.1.2 INSERT Policies

#### Policy: `properties_authenticated_insert`
**Who**: Any authenticated user  
**When**: Registering a new property  
**What**: Can insert with themselves as `created_by_user_id`  
**Condition**:
```
auth.uid() IS NOT NULL
AND created_by_user_id = auth.uid()
```
**Auto-action**: After insert, trigger creates owner role in `user_property_roles`  
**Rationale**: Anyone can claim/register a property initially

---

### 6.1.3 UPDATE Policies

#### Policy: `properties_owner_update`
**Who**: Property owners  
**When**: User has `owner` role  
**What**: All fields except `id`, `created_by_user_id`, `created_at`  
**Condition**:
```
is_property_owner(id)
AND deleted_at IS NULL
```
**Restrictions**:
- Cannot change `created_by_user_id`
- Cannot undelete (`deleted_at` can only be set, not unset, except by admin)

---

#### Policy: `properties_agent_update`
**Who**: Agents assigned to property  
**When**: User has `agent` role  
**What**: Marketing fields only: `display_address`, `latitude`, `longitude`, `status`  
**Condition**:
```
has_property_role(id, ARRAY['agent'])
AND is_within_access_window(id)
AND deleted_at IS NULL
```
**Rationale**: Agents update listing information

---

#### Policy: `properties_admin_update`
**Who**: Admins  
**When**: User is admin  
**What**: All fields  
**Condition**:
```
is_admin()
```
**Rationale**: Administrative override for corrections

---

### 6.1.4 DELETE Policies

#### Policy: `properties_owner_soft_delete`
**Who**: Property owners  
**When**: Soft delete only (set `deleted_at`)  
**What**: Can set `deleted_at` to NOW()  
**Condition**:
```
is_property_owner(id)
AND deleted_at IS NULL
```
**Implementation**: This is actually an UPDATE that sets `deleted_at`  
**Rationale**: Preserve history, allow property archival

---

#### Policy: `properties_admin_hard_delete`
**Who**: Admins only  
**When**: Admin decides to permanently remove  
**What**: True DELETE  
**Condition**:
```
is_admin()
```
**Rationale**: Only admins can permanently delete

---

### 6.1.5 Multi-Owner Scenarios

**Question**: What if property has 2 owners?

**Answer**: Both owners have full UPDATE rights. System does not enforce "majority vote" at RLS level. Application layer can add workflows if needed.

**Conflict resolution**: Last write wins (Postgres default). Application should use optimistic locking (`updated_at` check) for conflict detection.

---

### 6.1.6 Ownership Transfer

**Process**:
1. Current owner grants `owner` role to new owner
2. New owner accepts (application logic)
3. Original owner revokes their own `owner` role OR keeps joint ownership
4. No RLS policy prevents multiple owners

---

## 6.2 property_documents

**Table Purpose**: Metadata for documents stored in Supabase Storage

**Sensitivity**: HIGH - Contains legal, financial, identity documents

---

### 6.2.1 SELECT Policies

#### Policy: `documents_owner_read`
**Who**: Property owners  
**When**: User is owner  
**What**: All documents for owned properties  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```
**Rationale**: Owners see everything

---

#### Policy: `documents_role_based_read`
**Who**: Users with property roles  
**When**: User has role AND document type matches role permissions  
**What**: Documents appropriate to role  
**Condition**:
```
can_access_document(id)
AND status = 'active'
AND deleted_at IS NULL
```
**Rationale**: Granular document access per role (see helper function logic)

---

#### Policy: `documents_admin_read`
**Who**: Admins  
**When**: Always  
**What**: All documents including archived  
**Condition**:
```
is_admin()
```
**Rationale**: Admin oversight

---

### 6.2.2 INSERT Policies

#### Policy: `documents_owner_insert`
**Who**: Property owners  
**When**: User is owner  
**What**: Any document type  
**Condition**:
```
is_property_owner(property_id)
AND uploaded_by_user_id = auth.uid()
```
**Rationale**: Owners upload anything

---

#### Policy: `documents_agent_insert`
**Who**: Agents  
**When**: User is agent with valid access  
**What**: Marketing documents only: `floorplan`, `planning`, `warranty`  
**Condition**:
```
has_property_role(property_id, ARRAY['agent'])
AND is_within_access_window(property_id)
AND document_type IN ('floorplan', 'planning', 'warranty', 'other')
AND uploaded_by_user_id = auth.uid()
```
**Rationale**: Agents add marketing materials

---

#### Policy: `documents_surveyor_insert`
**Who**: Surveyors  
**When**: User is surveyor with valid access  
**What**: Survey documents: `survey`, `compliance`  
**Condition**:
```
has_property_role(property_id, ARRAY['surveyor'])
AND is_within_access_window(property_id)
AND document_type IN ('survey', 'compliance')
AND uploaded_by_user_id = auth.uid()
```
**Rationale**: Surveyors upload their reports

---

#### Policy: `documents_conveyancer_insert`
**Who**: Conveyancers  
**When**: User is conveyancer with valid access  
**What**: Legal documents: `title`, `search`, `identity`, `contract`, `compliance`  
**Condition**:
```
has_property_role(property_id, ARRAY['conveyancer'])
AND is_within_access_window(property_id)
AND document_type IN ('title', 'search', 'identity', 'contract', 'compliance')
AND uploaded_by_user_id = auth.uid()
```
**Rationale**: Conveyancers upload legal paperwork

---

### 6.2.3 UPDATE Policies

#### Policy: `documents_owner_update`
**Who**: Property owners  
**When**: User is owner  
**What**: All fields except `id`, `property_id`, `uploaded_by_user_id`  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```
**Rationale**: Owners can update metadata, change status

---

#### Policy: `documents_uploader_update`
**Who**: User who uploaded the document  
**When**: User is the uploader  
**What**: `title`, `description`, `status` only  
**Condition**:
```
uploaded_by_user_id = auth.uid()
AND deleted_at IS NULL
```
**Rationale**: Professionals can update their own uploads

---

### 6.2.4 DELETE Policies

#### Policy: `documents_owner_soft_delete`
**Who**: Property owners  
**When**: Soft delete (set `deleted_at`)  
**What**: Set `deleted_at` to NOW()  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```
**Implementation**: UPDATE that sets `deleted_at`  
**Rationale**: Preserve audit trail

---

#### Policy: `documents_admin_hard_delete`
**Who**: Admins  
**When**: Permanent deletion needed  
**What**: True DELETE  
**Condition**:
```
is_admin()
```
**Rationale**: Admin cleanup

---

### 6.2.5 Document Type Access Matrix

| Document Type | Owner | Buyer | Tenant | Agent | Surveyor | Conveyancer | Viewer |
|---------------|-------|-------|--------|-------|----------|-------------|--------|
| title | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| survey | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| search | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| identity | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| contract | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| warranty | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| planning | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| compliance | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| gas_safety | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| electrical_safety | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| epc | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| other | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Admin**: All document types

---

## 6.3 property_media

**Table Purpose**: Metadata for photos/videos stored in Supabase Storage

**Sensitivity**: LOW (photos) to MEDIUM (interior photos may reveal security info)

---

### 6.3.1 SELECT Policies

#### Policy: `media_public_featured_read`
**Who**: Everyone (including anonymous)  
**When**: Always  
**What**: Featured front elevation photos only  
**Condition**:
```
media_type = 'photo'
AND is_featured = true
AND status = 'active'
AND deleted_at IS NULL
AND EXISTS (
  SELECT 1 FROM properties
  WHERE properties.id = property_media.property_id
  AND properties.status = 'active'
  AND properties.deleted_at IS NULL
)
```
**Rationale**: Public property discovery

---

#### Policy: `media_stakeholder_read`
**Who**: Users with property access  
**When**: User has any role for property  
**What**: All active media  
**Condition**:
```
(
  is_admin()
  OR is_property_owner(property_id)
  OR is_approved_for_property(property_id)
)
AND status = 'active'
AND deleted_at IS NULL
```
**Rationale**: Stakeholders see all property photos

---

### 6.3.2 INSERT Policies

#### Policy: `media_owner_insert`
**Who**: Property owners  
**When**: User is owner  
**What**: Any media type  
**Condition**:
```
is_property_owner(property_id)
AND uploaded_by_user_id = auth.uid()
```
**Rationale**: Owners upload photos

---

#### Policy: `media_agent_insert`
**Who**: Agents  
**When**: User is agent with valid access  
**What**: Marketing photos: `photo`, `video`, `floorplan`  
**Condition**:
```
has_property_role(property_id, ARRAY['agent'])
AND is_within_access_window(property_id)
AND media_type IN ('photo', 'video', 'floorplan')
AND uploaded_by_user_id = auth.uid()
```
**Rationale**: Agents add listing photos

---

### 6.3.3 UPDATE Policies

#### Policy: `media_owner_update`
**Who**: Property owners  
**When**: User is owner  
**What**: All fields except `id`, `property_id`, `uploaded_by_user_id`  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```
**Rationale**: Owners manage media metadata

---

#### Policy: `media_uploader_update`
**Who**: User who uploaded the media  
**When**: User is the uploader  
**What**: `caption`, `room_type`, `is_featured`, `sort_order` only  
**Condition**:
```
uploaded_by_user_id = auth.uid()
AND deleted_at IS NULL
```
**Rationale**: Uploaders can tag their own media

---

### 6.3.4 DELETE Policies

#### Policy: `media_owner_soft_delete`
**Who**: Property owners  
**When**: Soft delete  
**What**: Set `deleted_at`  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```

---

#### Policy: `media_admin_hard_delete`
**Who**: Admins  
**When**: Permanent deletion  
**What**: True DELETE  
**Condition**:
```
is_admin()
```

---

## 6.4 users_extended

**Table Purpose**: Extended user profile data beyond Supabase auth.users

**Sensitivity**: HIGH - Contains personal information

---

### 6.4.1 SELECT Policies

#### Policy: `users_own_profile_read`
**Who**: The user themselves  
**When**: Always  
**What**: Their own profile  
**Condition**:
```
user_id = auth.uid()
AND deleted_at IS NULL
```
**Rationale**: Users see their own profile

---

#### Policy: `users_stakeholder_read`
**Who**: Users with shared property access  
**When**: Users are connected via the same property  
**What**: Limited profile: `full_name`, `organisation`, `primary_role`, `avatar_url`  
**Condition**:
```
EXISTS (
  SELECT 1 FROM user_property_roles upr1
  WHERE upr1.user_id = auth.uid()
  AND upr1.deleted_at IS NULL
  AND (upr1.expires_at IS NULL OR upr1.expires_at > NOW())
  AND EXISTS (
    SELECT 1 FROM user_property_roles upr2
    WHERE upr2.user_id = users_extended.user_id
    AND upr2.property_id = upr1.property_id
    AND upr2.deleted_at IS NULL
  )
)
AND deleted_at IS NULL
```
**Fields exposed**: `full_name`, `organisation`, `primary_role`, `avatar_url` ONLY  
**Rationale**: See co-stakeholders on shared properties

---

#### Policy: `users_admin_read`
**Who**: Admins  
**When**: Always  
**What**: All profiles  
**Condition**:
```
is_admin()
```
**Rationale**: User management

---

### 6.4.2 INSERT Policies

#### Policy: `users_self_insert`
**Who**: Authenticated user  
**When**: Creating their profile  
**What**: One profile per user  
**Condition**:
```
user_id = auth.uid()
AND NOT EXISTS (
  SELECT 1 FROM users_extended
  WHERE user_id = auth.uid()
)
```
**Rationale**: Self-registration

---

### 6.4.3 UPDATE Policies

#### Policy: `users_self_update`
**Who**: The user themselves  
**When**: Updating own profile  
**What**: All fields except `id`, `user_id`, `created_at`  
**Condition**:
```
user_id = auth.uid()
AND deleted_at IS NULL
```
**Rationale**: Profile management

---

#### Policy: `users_admin_update`
**Who**: Admins  
**When**: Always  
**What**: All fields  
**Condition**:
```
is_admin()
```
**Rationale**: Admin corrections

---

### 6.4.4 DELETE Policies

#### Policy: `users_self_soft_delete`
**Who**: The user themselves  
**When**: Account deletion  
**What**: Set `deleted_at`  
**Condition**:
```
user_id = auth.uid()
AND deleted_at IS NULL
```
**Implementation**: UPDATE that sets `deleted_at`  
**Rationale**: GDPR compliance, account deactivation

---

#### Policy: `users_admin_hard_delete`
**Who**: Admins  
**When**: Permanent removal  
**What**: True DELETE  
**Condition**:
```
is_admin()
```

---

## 6.5 user_property_roles

**Table Purpose**: Role assignments per property (access control matrix)

**Sensitivity**: HIGH - This table IS the security model

---

### 6.5.1 SELECT Policies

#### Policy: `roles_own_roles_read`
**Who**: Any user  
**When**: Viewing own roles  
**What**: Their own role assignments  
**Condition**:
```
user_id = auth.uid()
AND deleted_at IS NULL
```
**Rationale**: Users see their own access

---

#### Policy: `roles_property_stakeholder_read`
**Who**: Users with property access  
**When**: User has role on the property  
**What**: All role assignments for that property  
**Condition**:
```
EXISTS (
  SELECT 1 FROM user_property_roles my_roles
  WHERE my_roles.user_id = auth.uid()
  AND my_roles.property_id = user_property_roles.property_id
  AND my_roles.deleted_at IS NULL
  AND (my_roles.expires_at IS NULL OR my_roles.expires_at > NOW())
)
AND deleted_at IS NULL
```
**Rationale**: See who else has access to shared properties

---

#### Policy: `roles_admin_read`
**Who**: Admins  
**When**: Always  
**What**: All roles  
**Condition**:
```
is_admin()
```

---

### 6.5.2 INSERT Policies

#### Policy: `roles_owner_grant`
**Who**: Property owners  
**When**: User is owner  
**What**: Can grant any role except `admin`  
**Condition**:
```
is_property_owner(property_id)
AND granted_by_user_id = auth.uid()
AND role != 'admin'
```
**Rationale**: Owners invite stakeholders

---

#### Policy: `roles_admin_grant`
**Who**: Admins  
**When**: Always  
**What**: Can grant any role including `admin`  
**Condition**:
```
is_admin()
AND granted_by_user_id = auth.uid()
```
**Rationale**: Admin user management

---

#### Policy: `roles_auto_owner_insert`
**Who**: System (trigger)  
**When**: Property is created  
**What**: Auto-grant `owner` role to creator  
**Implementation**: Database trigger, not RLS policy  
**Rationale**: Creator becomes owner automatically

---

### 6.5.3 UPDATE Policies

#### Policy: `roles_granter_update`
**Who**: User who granted the role  
**When**: User is the granter  
**What**: Can update `expires_at`, `deleted_at` (revoke)  
**Condition**:
```
granted_by_user_id = auth.uid()
AND deleted_at IS NULL
```
**Rationale**: Granter can modify/revoke access

---

#### Policy: `roles_owner_update`
**Who**: Property owners  
**When**: User is owner  
**What**: Can update any role except other owners  
**Condition**:
```
is_property_owner(property_id)
AND role != 'owner'
AND deleted_at IS NULL
```
**Rationale**: Owners manage non-owner roles

---

#### Policy: `roles_admin_update`
**Who**: Admins  
**When**: Always  
**What**: All roles  
**Condition**:
```
is_admin()
```

---

### 6.5.4 DELETE Policies

#### Policy: `roles_owner_soft_delete`
**Who**: Property owners  
**When**: Revoking access  
**What**: Set `deleted_at` (soft delete)  
**Condition**:
```
is_property_owner(property_id)
AND role != 'owner'  -- Cannot revoke other owners
AND deleted_at IS NULL
```
**Implementation**: UPDATE that sets `deleted_at`

---

#### Policy: `roles_admin_hard_delete`
**Who**: Admins  
**When**: Permanent removal  
**What**: True DELETE  
**Condition**:
```
is_admin()
```

---

### 6.5.5 Edge Case: Ownership Revocation

**Question**: Can an owner revoke another owner's access?

**Answer**: No, per policy above. Owners cannot revoke other `owner` roles.

**Process for ownership transfer**:
1. Owner A grants `owner` to User B
2. Owner A can voluntarily set their own `deleted_at` (self-revoke)
3. OR both remain as co-owners

**Admin override**: Admins can revoke any role

---

### 6.5.6 Edge Case: Last Owner Protection

**Question**: What if the last owner revokes their own access?

**Answer**: Application layer should prevent this with a check:
```sql
-- Before allowing self-revoke
SELECT COUNT(*) FROM user_property_roles
WHERE property_id = :property_id
AND role = 'owner'
AND deleted_at IS NULL
AND (expires_at IS NULL OR expires_at > NOW())
```
If count = 1, prevent deletion.

**RLS does not enforce this** - it's application logic.

---

## 6.6 property_events

**Table Purpose**: Immutable event log for property lifecycle

**Sensitivity**: MEDIUM - Audit trail

---

### 6.6.1 SELECT Policies

#### Policy: `events_stakeholder_read`
**Who**: Users with property access  
**When**: User has role on property  
**What**: All events for accessible properties  
**Condition**:
```
(
  is_admin()
  OR is_property_owner(property_id)
  OR is_approved_for_property(property_id)
)
```
**Rationale**: Stakeholders see property history

---

#### Policy: `events_admin_read`
**Who**: Admins  
**When**: Always  
**What**: All events  
**Condition**:
```
is_admin()
```

---

### 6.6.2 INSERT Policies

#### Policy: `events_stakeholder_insert`
**Who**: Users with property access  
**When**: User has role on property  
**What**: Can log events related to their actions  
**Condition**:
```
(
  is_property_owner(property_id)
  OR is_approved_for_property(property_id)
)
AND (actor_user_id = auth.uid() OR actor_user_id IS NULL)
```
**Rationale**: Activity logging

---

#### Policy: `events_system_insert`
**Who**: System (triggers, background jobs)  
**When**: Automated events  
**What**: Can insert with `actor_user_id IS NULL`  
**Implementation**: Service role key, not user session  
**Rationale**: System-generated events

---

### 6.6.3 UPDATE Policies

**No UPDATE policies** - Events are immutable

---

### 6.6.4 DELETE Policies

#### Policy: `events_admin_only_delete`
**Who**: Admins only  
**When**: Cleanup or compliance  
**What**: True DELETE  
**Condition**:
```
is_admin()
```
**Rationale**: Immutability, admin-only cleanup

---

## 6.7 property_flags

**Table Purpose**: Quality/risk/compliance flags

**Sensitivity**: MEDIUM - May indicate legal issues

---

### 6.7.1 SELECT Policies

#### Policy: `flags_stakeholder_read`
**Who**: Users with property access  
**When**: User has role on property  
**What**: All flags for accessible properties  
**Condition**:
```
(
  is_admin()
  OR is_property_owner(property_id)
  OR is_approved_for_property(property_id)
)
AND deleted_at IS NULL
```
**Rationale**: Transparency on issues

---

### 6.7.2 INSERT Policies

#### Policy: `flags_authenticated_insert`
**Who**: Any user with property access  
**When**: User has role on property  
**What**: Can create flags  
**Condition**:
```
(
  is_property_owner(property_id)
  OR is_approved_for_property(property_id)
)
AND created_by_user_id = auth.uid()
```
**Rationale**: Anyone can flag issues

---

### 6.7.3 UPDATE Policies

#### Policy: `flags_owner_update`
**Who**: Property owners  
**When**: User is owner  
**What**: Can update status, resolve flags  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```
**Rationale**: Owners manage property quality

---

#### Policy: `flags_creator_update`
**Who**: User who created the flag  
**When**: User is creator  
**What**: Can update description, severity  
**Condition**:
```
created_by_user_id = auth.uid()
AND status = 'open'  -- Can only update open flags
AND deleted_at IS NULL
```
**Rationale**: Flag creator can clarify

---

#### Policy: `flags_admin_update`
**Who**: Admins  
**When**: Always  
**What**: All fields  
**Condition**:
```
is_admin()
```

---

### 6.7.4 DELETE Policies

#### Policy: `flags_owner_soft_delete`
**Who**: Property owners  
**When**: Dismissing flags  
**What**: Set `deleted_at`  
**Condition**:
```
is_property_owner(property_id)
AND deleted_at IS NULL
```

---

#### Policy: `flags_admin_hard_delete`
**Who**: Admins  
**When**: Cleanup  
**What**: True DELETE  
**Condition**:
```
is_admin()
```

---

## 6.8 audit_logs

**Table Purpose**: System-wide audit trail of sensitive actions

**Sensitivity**: CRITICAL - Security audit data

---

### 6.8.1 SELECT Policies

#### Policy: `audit_own_actions_read`
**Who**: Any user  
**When**: Viewing own actions  
**What**: Logs where they are the actor  
**Condition**:
```
actor_user_id = auth.uid()
```
**Rationale**: Users see their own activity

---

#### Policy: `audit_admin_read`
**Who**: Admins only  
**When**: Always  
**What**: All audit logs  
**Condition**:
```
is_admin()
```
**Rationale**: Security monitoring

---

### 6.8.2 INSERT Policies

#### Policy: `audit_authenticated_insert`
**Who**: Any authenticated user  
**When**: Performing auditable action  
**What**: Can insert their own actions  
**Condition**:
```
actor_user_id = auth.uid()
```
**Rationale**: Self-logging

---

#### Policy: `audit_system_insert`
**Who**: System (backend services)  
**When**: System-triggered events  
**What**: Can insert with any/no actor_user_id  
**Implementation**: Service role key  
**Rationale**: System events

---

### 6.8.3 UPDATE Policies

**No UPDATE policies** - Audit logs are immutable

---

### 6.8.4 DELETE Policies

#### Policy: `audit_admin_delete`
**Who**: Admins only  
**When**: Compliance (GDPR data deletion)  
**What**: True DELETE  
**Condition**:
```
is_admin()
```
**Rationale**: Compliance, admin-only

**Warning**: This should trigger alerts as audit log deletion is sensitive

---

## EDGE CASES & CONFLICT RESOLUTION

### 7.1 User with Multiple Roles on Same Property

**Scenario**: User A is both `owner` AND `agent` for Property X

**Resolution**:
- Helper functions return TRUE if ANY matching role exists
- User gets highest privilege level (owner trumps agent)
- Policies OR together: `is_owner() OR has_role(['agent'])`
- Access is additive, not restrictive

**Implementation**: No conflict - multiple roles grant maximum permissions

---

### 7.2 Expired Role but Also Creator

**Scenario**: User A created Property X (has `created_by_user_id`). Their `owner` role later expired/revoked.

**Resolution**:
- `is_property_creator()` remains TRUE forever
- Policies should check: `is_property_owner() OR is_property_creator()`
- Creator retains read access, limited write access
- Full ownership requires active `owner` role

**Recommendation**: Application should prevent this scenario (can't revoke creator's owner role)

---

### 7.3 Buyer Becomes Owner

**Scenario**: User A is `buyer` for Property X. They complete purchase and become `owner`.

**Process**:
1. Owner grants `buyer` role (with expiry date = completion date)
2. At completion, owner grants `owner` role to buyer
3. Buyer's `buyer` role automatically becomes irrelevant (owner > buyer)
4. Previous owner may revoke their own `owner` role

**RLS handling**: Both roles co-exist, owner permissions apply

---

### 7.4 Tenant Who Is Also Owner (Landlord)

**Scenario**: User A owns Property X and also lives there (tenant).

**Resolution**:
- User has both `owner` and `tenant` roles
- Owner permissions supersede tenant permissions
- No conflict - policies are additive

---

### 7.5 Document Access: Buyer vs Tenant vs Surveyor

**Scenario**: Property X has:
- User A: buyer
- User B: tenant  
- User C: surveyor

All want to view a `survey` document.

**Resolution** (via `can_access_document()` function):
- User A (buyer): ✅ Can view (buyers see surveys)
- User B (tenant): ❌ Cannot view (tenants don't see surveys)
- User C (surveyor): ✅ Can view (surveyors see surveys)

**Implementation**: Document type access matrix enforced in helper function

---

### 7.6 Ownership Transfer in Progress

**Scenario**: Property X has:
- Owner A (current owner, selling)
- Buyer B (purchasing, completion in 60 days)

**Current State**:
- Owner A: `owner` role, active
- Buyer B: `buyer` role, expires_at = completion_date + 30 days

**At Completion**:
1. Owner A grants `owner` role to Buyer B
2. Owner A can:
   - Keep `owner` role (joint ownership)
   - Revoke their own `owner` role
   - Transfer to `viewer` role for historical access

**RLS Impact**: During transfer, both can be owners simultaneously. No conflict.

---

### 7.7 Surveyor Access Expiry During Upload

**Scenario**: Surveyor is uploading survey document. Their access expires mid-upload.

**Resolution**:
- INSERT policy checks `is_within_access_window()` at INSERT time
- If expired: INSERT fails, upload rejected
- Application should check expiry BEFORE starting upload
- Use transaction: check expiry → upload file → insert metadata

**Recommendation**: Application adds buffer (don't allow uploads within 24hrs of expiry)

---

### 7.8 Agent Revoked But Documents Remain

**Scenario**: Agent uploaded 10 photos. Owner revokes agent's access. What happens to photos?

**Resolution**:
- Photos remain in database (uploaded_by_user_id still = agent's UUID)
- Agent can NO LONGER view/edit them (property_id access check fails)
- Owner can still see and manage all photos
- Agent's name remains in `uploaded_by_user_id` for audit trail

**RLS**: Agent loses SELECT access immediately upon revocation/expiry

---

### 7.9 Admin Override vs Owner Permissions

**Scenario**: Admin wants to modify property that Owner is actively managing.

**Resolution**:
- Admin policies return TRUE for ALL operations
- Admin bypasses all permission checks
- Both admin and owner can make changes simultaneously
- Last write wins (Postgres default)

**Best Practice**: Application shows warning when admin overrides owner

---

### 7.10 Soft Delete vs Hard Delete

**Scenario**: Owner soft-deletes property (sets deleted_at). Admin hard-deletes it later.

**Resolution**:
- Soft delete: Sets `deleted_at`, row remains, policies exclude it
- Hard delete: Row removed, CASCADE deletes all related data
- Only admins can hard delete
- Soft delete is reversible (admin can unset deleted_at)

**Cascade Impact**: 
- Hard deleting property deletes ALL related records (documents, media, roles, events, flags)
- ON DELETE CASCADE in foreign keys

---

## SECURITY PRINCIPLES

### 8.1 Least Privilege

Every role has ONLY the minimum permissions required for their function. No blanket access.

### 8.2 Defense in Depth

Multiple security layers:
1. RLS policies at database level
2. Application-level validation
3. API key security (server-side only)
4. Storage bucket policies
5. Audit logging

### 8.3 Explicit Deny

Absence of a policy = DENY by default. Users must explicitly be granted access.

### 8.4 Time-Based Access

Professional roles (agent, surveyor, conveyancer) must have expiry dates. System automatically revokes expired access.

### 8.5 No Privilege Escalation

Users cannot grant themselves roles. Roles must be granted by:
- Property owner
- Admin
- System (initial owner grant on property creation)

### 8.6 Immutable Audit Trail

`property_events` and `audit_logs` are append-only. Updates are forbidden. Deletes are admin-only and logged.

### 8.7 Public Data Separation

Public property data (address, UPRN, location) is explicitly separated from private data (documents, financials). Public SELECT policies have no auth.uid() check.

### 8.8 No Information Leakage

Failed permission checks do not reveal why access was denied. Generic "Permission denied" error.

### 8.9 Cascading Revocation

Revoking a role in `user_property_roles` immediately affects ALL tables via helper function checks.

### 8.10 Admin Accountability

All admin actions are logged in `audit_logs`. Admins cannot delete their own audit logs.

---

## TESTING REQUIREMENTS

### 9.1 Unit Tests (Per Policy)

For EACH policy, create tests that verify:

**Positive Tests:**
- ✅ Authorized user CAN perform action
- ✅ Correct data is returned
- ✅ Updates succeed with valid conditions

**Negative Tests:**
- ❌ Unauthorized user CANNOT perform action
- ❌ Expired role is denied
- ❌ Revoked role is denied
- ❌ Wrong role type is denied

**Example Test Case:**
```
Test: documents_buyer_read policy
Given: User A is buyer for Property X
And: Document D is type "survey" (buyer-accessible)
When: User A SELECTs from property_documents WHERE id = D
Then: Row is returned

Given: User A is buyer for Property X
And: Document D is type "title" (not buyer-accessible)
When: User A SELECTs from property_documents WHERE id = D
Then: Zero rows returned (access denied)
```

---

### 9.2 Integration Tests (Cross-Table)

Test scenarios that span multiple tables:

**Test: Property Ownership Transfer**
1. Create Property X with Owner A
2. Verify Owner A has `owner` role in user_property_roles
3. Owner A grants `buyer` role to User B
4. Verify User B can view property but not edit
5. Owner A grants `owner` role to User B
6. Verify User B can now edit property
7. Owner A revokes own `owner` role
8. Verify Owner A can no longer edit property
9. Verify User B still has full access

**Test: Document Access by Role**
1. Create Property X with Owner A
2. Upload document type "title"
3. Grant `buyer` role to User B
4. Verify User B CANNOT view "title" document
5. Grant `conveyancer` role to User C
6. Verify User C CAN view "title" document

**Test: Expiry Enforcement**
1. Create Property X with Owner A
2. Grant `surveyor` role to User B with expires_at = NOW() + 1 day
3. Verify User B can upload survey
4. Wait for expiry (or manually set expires_at to past)
5. Verify User B can NO LONGER upload or view

---

### 9.3 Security Tests

**Test: Privilege Escalation Prevention**
- User A (buyer) attempts to INSERT into user_property_roles to grant themselves `owner`
- Expected: INSERT denied

**Test: Unauthorized Data Access**
- User A has no role on Property X
- User A attempts to SELECT property_documents for Property X
- Expected: Zero rows returned

**Test: Admin Override**
- Admin user attempts to SELECT/UPDATE/DELETE on any table
- Expected: All operations succeed

**Test: Public Data Access**
- Anonymous user (no auth.uid()) attempts to SELECT public fields from properties
- Expected: Public fields returned for active properties

**Test: Soft Delete Visibility**
- Property X is soft-deleted (deleted_at set)
- Non-admin user attempts to SELECT Property X
- Expected: Zero rows returned (deleted properties hidden)

---

### 9.4 Performance Tests

**Test: Policy Overhead**
- Measure query performance with RLS enabled vs disabled
- Target: <10% overhead for SELECT queries
- Use EXPLAIN ANALYZE to verify indexes are used

**Test: Role Lookup Performance**
- User with 100 properties
- Measure time to check has_property_role() across all properties
- Target: <100ms for role resolution

---

## APPROVAL CHECKLIST

Before implementing RLS policies as SQL, verify:

### 10.1 Design Validation

- [ ] All 8 roles defined with clear responsibilities
- [ ] Public vs private data clearly separated
- [ ] Helper functions specified with complete logic
- [ ] Edge cases identified and resolved
- [ ] Security principles documented

### 10.2 Policy Coverage

- [ ] properties: 4 policy types (SELECT/INSERT/UPDATE/DELETE)
- [ ] property_documents: 4 policy types
- [ ] property_media: 4 policy types
- [ ] users_extended: 4 policy types
- [ ] user_property_roles: 4 policy types
- [ ] property_events: 2 policy types (INSERT/DELETE only)
- [ ] property_flags: 4 policy types
- [ ] audit_logs: 2 policy types (INSERT/DELETE only)

### 10.3 Role Matrix Validation

- [ ] Admin has access to everything
- [ ] Owner has full property control
- [ ] Buyer has read access to shared properties
- [ ] Tenant has limited read access
- [ ] Agent can upload marketing materials
- [ ] Surveyor can upload surveys
- [ ] Conveyancer can access legal docs
- [ ] Viewer has read-only on explicitly shared properties

### 10.4 Document Access Matrix

- [ ] All document types assigned to appropriate roles
- [ ] Sensitive documents (title, contract, identity) restricted to owner/conveyancer
- [ ] Safety documents (gas, electrical, epc) accessible to tenants
- [ ] Marketing documents (survey, planning, warranty) accessible to buyers/agents

### 10.5 Expiry & Revocation

- [ ] All non-owner roles support expires_at
- [ ] Expired roles immediately lose access
- [ ] Soft delete (deleted_at) immediately revokes access
- [ ] Revocation cascades across all tables

### 10.6 Multi-Owner & Edge Cases

- [ ] Multiple owners supported
- [ ] Ownership transfer process defined
- [ ] Creator vs owner distinction handled
- [ ] Multi-role scenarios resolved (additive permissions)

### 10.7 Testing Plan

- [ ] Positive test cases defined
- [ ] Negative test cases defined
- [ ] Integration test scenarios planned
- [ ] Security test scenarios planned
- [ ] Performance benchmarks set

### 10.8 Implementation Readiness

- [ ] Helper functions specified (8 functions)
- [ ] Policy logic documented for each table
- [ ] SQL implementation sequence defined:
  1. Create helper functions
  2. Enable RLS on all tables
  3. Create SELECT policies
  4. Create INSERT policies
  5. Create UPDATE policies
  6. Create DELETE policies
  7. Test each policy individually
  8. Run integration tests

### 10.9 Compliance & Audit

- [ ] GDPR considerations addressed (soft delete, audit log retention)
- [ ] Audit logging covers all sensitive operations
- [ ] Admin actions logged and tracked
- [ ] User data access logged

### 10.10 Documentation

- [ ] This plan reviewed by technical lead
- [ ] Security team review completed
- [ ] Product team confirms role model aligns with business requirements
- [ ] Legal review for GDPR/data protection compliance

---

## NEXT STEPS

1. **Human Review**: Technical lead reviews this plan
2. **Stakeholder Approval**: Product, security, legal sign-off
3. **SQL Generation**: Convert this plan to SQL migration file
4. **Test Harness**: Create test suite based on Section 9
5. **Staging Deployment**: Apply to staging environment
6. **Security Audit**: Third-party security review
7. **Performance Testing**: Verify query performance
8. **Production Deployment**: Apply to production with rollback plan

---

## DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-27 | AI Agent (Cursor) | Initial comprehensive RLS policy plan |

---

**END OF RLS POLICY PLAN**

This document serves as the authoritative specification for implementing Row Level Security in Property Passport UK v7.0. No SQL should be generated until this plan is reviewed and approved by technical leadership, security team, and legal compliance.
