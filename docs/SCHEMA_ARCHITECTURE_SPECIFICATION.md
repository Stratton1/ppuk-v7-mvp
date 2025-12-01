# Property Passport UK v7.0 - Complete Database Schema Architecture Specification

**Version:** 1.0  
**Date:** December 2024  
**Status:** SPECIFICATION (Ready for SQL Migration Generation)  
**Purpose:** Complete relational schema blueprint for PPUK v7.0 on Supabase (PostgreSQL) with full RLS

---

## SCHEMA OVERVIEW

Property Passport UK v7.0 uses a **UPRN-centric architecture** where every UK residential property is uniquely identified by its Unique Property Reference Number (UPRN). The schema supports:

- **Multi-stakeholder property access** via role-based permissions
- **Public property discovery** (address, location, basic data)
- **Private document/media management** with granular access control
- **Audit trails** for all sensitive operations
- **Time-bound professional access** with expiry dates
- **Soft-delete patterns** for data preservation

**Core Design Principles:**
- UUID primary keys for all tables
- Text-based enums (CHECK constraints) instead of PostgreSQL ENUMs
- Soft-delete via `deleted_at` timestamps
- Automatic `updated_at` triggers on all tables
- Foreign keys with ON DELETE CASCADE
- Row Level Security (RLS) on all user-data tables

---

## TABLES

### 1. properties

**Purpose:** Core property record anchored by UPRN. Every property passport is built around a UPRN.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `uprn`: TEXT (NOT NULL, UNIQUE) - Unique Property Reference Number
- `display_address`: TEXT (NOT NULL) - Human-readable address
- `latitude`: NUMERIC(10,7) (NULLABLE) - Geographic coordinate
- `longitude`: NUMERIC(10,7) (NULLABLE) - Geographic coordinate
- `status`: TEXT (NOT NULL, default: 'draft') - CHECK: 'draft', 'active', 'archived'
- `created_by_user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `deleted_at`: TIMESTAMPTZ (NULLABLE) - Soft delete timestamp

**Constraints:**
- UNIQUE on `uprn`
- CHECK: `length(trim(display_address)) > 0`

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `uprn`
- INDEX on `status` WHERE `deleted_at IS NULL`
- INDEX on `created_by_user_id`
- INDEX on `deleted_at` WHERE `deleted_at IS NULL` (for active properties)

**Relationships:**
- One-to-many: `property_documents` (property_id)
- One-to-many: `property_media` (property_id)
- One-to-many: `user_property_roles` (property_id)
- One-to-many: `property_events` (property_id)
- One-to-many: `property_flags` (property_id)
- One-to-many: `property_tasks` (property_id)
- One-to-many: `property_notes` (property_id)

**RLS Notes:**
- Public fields (id, uprn, display_address, latitude, longitude, status) readable by anonymous users for active properties
- Full access requires property role or ownership
- Only owners can update (except admins)

---

### 2. property_documents

**Purpose:** Metadata for documents stored in Supabase Storage (`property-documents` bucket). Documents are accessed via signed URLs.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `uploaded_by_user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `title`: TEXT (NOT NULL) - Document display name
- `document_type`: TEXT (NOT NULL, default: 'other') - CHECK: 'title', 'survey', 'search', 'identity', 'contract', 'warranty', 'planning', 'compliance', 'gas_safety', 'electrical_safety', 'epc', 'other'
- `storage_bucket`: TEXT (NOT NULL, default: 'property-documents')
- `storage_path`: TEXT (NOT NULL) - Path within bucket
- `mime_type`: TEXT (NOT NULL) - MIME type (e.g., 'application/pdf')
- `size_bytes`: BIGINT (NOT NULL, CHECK: >= 0) - File size in bytes
- `version`: INTEGER (NOT NULL, default: 1, CHECK: >= 1) - Document version
- `checksum`: TEXT (NULLABLE) - File integrity hash
- `status`: TEXT (NOT NULL, default: 'active') - CHECK: 'active', 'archived'
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `deleted_at`: TIMESTAMPTZ (NULLABLE) - Soft delete

**Constraints:**
- CHECK: `length(trim(title)) > 0`
- CHECK: `length(trim(storage_path)) > 0`

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `property_id`
- INDEX on `uploaded_by_user_id`
- INDEX on `document_type`
- INDEX on `status` WHERE `deleted_at IS NULL`
- INDEX on `deleted_at` WHERE `deleted_at IS NULL`

**Relationships:**
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (uploaded_by_user_id)

**RLS Notes:**
- HIGH SENSITIVITY - Contains legal, financial, identity documents
- Owners see all documents
- Role-based access via `can_access_document()` helper function
- Document type determines which roles can view (see RLS_POLICY_PLAN.md)
- Only owners can delete (soft delete)

---

### 3. property_media

**Purpose:** Metadata for photos/videos/floorplans stored in Supabase Storage (`property-photos` bucket). Media accessed via signed URLs.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `uploaded_by_user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `media_type`: TEXT (NOT NULL, default: 'photo') - CHECK: 'photo', 'video', 'floorplan', 'other'
- `title`: TEXT (NOT NULL) - Media display name/caption
- `storage_bucket`: TEXT (NOT NULL, default: 'property-photos')
- `storage_path`: TEXT (NOT NULL) - Path within bucket
- `mime_type`: TEXT (NOT NULL) - MIME type (e.g., 'image/jpeg')
- `size_bytes`: BIGINT (NOT NULL, CHECK: >= 0) - File size
- `checksum`: TEXT (NULLABLE) - File integrity hash
- `is_featured`: BOOLEAN (NOT NULL, default: FALSE) - Featured front elevation photo
- `sort_order`: INTEGER (default: 0) - Display order
- `status`: TEXT (NOT NULL, default: 'active') - CHECK: 'active', 'archived'
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `deleted_at`: TIMESTAMPTZ (NULLABLE) - Soft delete

**Constraints:**
- CHECK: `length(trim(title)) > 0`
- CHECK: `length(trim(storage_path)) > 0`

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `property_id`
- INDEX on `uploaded_by_user_id`
- INDEX on `media_type`
- INDEX on `is_featured` WHERE `status = 'active' AND deleted_at IS NULL`
- INDEX on `status` WHERE `deleted_at IS NULL`

**Relationships:**
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (uploaded_by_user_id)

**RLS Notes:**
- LOW-MEDIUM SENSITIVITY (photos may reveal security info)
- Featured photos (is_featured = true) are PUBLIC for active properties
- All media visible to users with property access
- Only owners can delete (soft delete)

---

### 4. users_extended

**Purpose:** Extended profile data beyond Supabase `auth.users`. Links to auth.users via `user_id`.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `user_id`: UUID (NOT NULL, UNIQUE, FK: auth.users.id, ON DELETE CASCADE)
- `full_name`: TEXT (NULLABLE) - User's full name
- `phone`: TEXT (NULLABLE) - Phone number
- `organisation`: TEXT (NULLABLE) - Company/organisation name
- `primary_role`: TEXT (NOT NULL, default: 'viewer') - CHECK: 'owner', 'buyer', 'agent', 'conveyancer', 'surveyor', 'admin', 'viewer'
- `avatar_url`: TEXT (NULLABLE) - Profile picture URL
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `deleted_at`: TIMESTAMPTZ (NULLABLE) - Soft delete

**Constraints:**
- UNIQUE on `user_id` (one profile per user)

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `user_id`
- INDEX on `primary_role`
- INDEX on `deleted_at` WHERE `deleted_at IS NULL`

**Relationships:**
- One-to-one: `auth.users` (user_id)
- One-to-many: `user_property_roles` (user_id)

**RLS Notes:**
- HIGH SENSITIVITY - Personal information
- Users see their own profile
- Limited profile (name, organisation, role, avatar) visible to co-stakeholders on shared properties
- Admins see all profiles
- Users can update their own profile

---

### 5. user_property_roles

**Purpose:** Property-specific role assignments. This table IS the access control matrix. Defines who can access which property with what permissions.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `role`: TEXT (NOT NULL) - CHECK: 'owner', 'buyer', 'agent', 'conveyancer', 'surveyor', 'admin', 'viewer', 'tenant'
- `granted_by_user_id`: UUID (NULLABLE, FK: auth.users.id, ON DELETE CASCADE) - Who granted this role
- `granted_at`: TIMESTAMPTZ (NOT NULL, default: NOW()) - When access was granted
- `expires_at`: TIMESTAMPTZ (NULLABLE) - When access expires (NULL = permanent)
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `deleted_at`: TIMESTAMPTZ (NULLABLE) - Soft delete (revocation)

**Constraints:**
- UNIQUE on (`user_id`, `property_id`, `role`) - One role per user per property (but user can have multiple different roles)

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on (`user_id`, `property_id`, `role`)
- INDEX on `user_id`
- INDEX on `property_id`
- INDEX on `role`
- INDEX on `expires_at` WHERE `expires_at IS NOT NULL`
- INDEX on `deleted_at` WHERE `deleted_at IS NULL`
- COMPOSITE INDEX on (`property_id`, `deleted_at`, `expires_at`) for RLS performance

**Relationships:**
- Many-to-one: `auth.users` (user_id)
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (granted_by_user_id)

**RLS Notes:**
- CRITICAL SENSITIVITY - This table IS the security model
- Users see their own roles
- Users with property access see all roles for that property
- Only owners can grant roles (except admins)
- Owners cannot revoke other owners' roles
- Expired roles (expires_at < NOW()) are automatically denied
- Soft-deleted roles (deleted_at IS NOT NULL) are revoked

**Special Logic:**
- When property is created, trigger auto-grants `owner` role to `created_by_user_id`
- Multiple owners allowed (joint ownership)
- Last owner cannot revoke themselves (application-level check)

---

### 6. property_events

**Purpose:** Immutable event log for property lifecycle. Audit trail of all property-related actions.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `actor_user_id`: UUID (NULLABLE, FK: auth.users.id, ON DELETE CASCADE) - Who performed the action (NULL = system)
- `event_type`: TEXT (NOT NULL) - CHECK: 'created', 'updated', 'status_changed', 'document_uploaded', 'media_uploaded', 'note_added', 'task_created', 'task_completed', 'flag_added', 'flag_resolved', 'role_granted', 'role_revoked'
- `event_payload`: JSONB (NULLABLE) - Event-specific data
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW()) - Rarely changes (immutable)

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `property_id`
- INDEX on `actor_user_id`
- INDEX on `event_type`
- INDEX on `created_at` DESC (for timeline queries)
- COMPOSITE INDEX on (`property_id`, `created_at` DESC)

**Relationships:**
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (actor_user_id)

**RLS Notes:**
- MEDIUM SENSITIVITY - Audit trail
- Users with property access can view events
- Events are IMMUTABLE (no UPDATE policies)
- Only admins can DELETE (compliance cleanup)
- System events have `actor_user_id = NULL`

---

### 7. property_flags

**Purpose:** Quality/risk/compliance flags for properties. Tracks data quality issues, risks, compliance problems.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `created_by_user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `flag_type`: TEXT (NOT NULL) - CHECK: 'data_quality', 'risk', 'compliance', 'ownership', 'document', 'other'
- `severity`: TEXT (NOT NULL) - CHECK: 'low', 'medium', 'high', 'critical'
- `status`: TEXT (NOT NULL, default: 'open') - CHECK: 'open', 'in_review', 'resolved', 'dismissed'
- `description`: TEXT (NULLABLE) - Flag details
- `resolved_at`: TIMESTAMPTZ (NULLABLE) - When flag was resolved
- `resolved_by_user_id`: UUID (NULLABLE, FK: auth.users.id, ON DELETE CASCADE)
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `deleted_at`: TIMESTAMPTZ (NULLABLE) - Soft delete

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `property_id`
- INDEX on `created_by_user_id`
- INDEX on `flag_type`
- INDEX on `severity`
- INDEX on `status` WHERE `deleted_at IS NULL`
- COMPOSITE INDEX on (`property_id`, `status`, `severity`)

**Relationships:**
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (created_by_user_id)
- Many-to-one: `auth.users` (resolved_by_user_id)

**RLS Notes:**
- MEDIUM SENSITIVITY - May indicate legal issues
- Users with property access can view flags
- Anyone with property access can create flags
- Only owners can resolve/dismiss flags
- Flag creator can update open flags

---

### 8. audit_logs

**Purpose:** System-wide audit trail of sensitive actions. Tracks all security-relevant operations across the platform.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `actor_user_id`: UUID (NULLABLE, FK: auth.users.id, ON DELETE SET NULL) - Who performed action (NULL = system)
- `action`: TEXT (NOT NULL) - Action type (e.g., 'login', 'role_granted', 'document_deleted', 'property_created')
- `resource_type`: TEXT (NOT NULL) - Resource type (e.g., 'property', 'document', 'user', 'role')
- `resource_id`: UUID (NULLABLE) - ID of affected resource
- `resource_path`: TEXT (NULLABLE) - Resource path/identifier
- `ip_address`: INET (NULLABLE) - Request IP address
- `user_agent`: TEXT (NULLABLE) - User agent string
- `metadata`: JSONB (NULLABLE) - Additional audit data
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW()) - Rarely changes

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `actor_user_id`
- INDEX on `action`
- INDEX on `resource_type`
- INDEX on `resource_id`
- INDEX on `created_at` DESC (for audit queries)
- COMPOSITE INDEX on (`actor_user_id`, `created_at` DESC)
- COMPOSITE INDEX on (`resource_type`, `resource_id`)

**Relationships:**
- Many-to-one: `auth.users` (actor_user_id)

**RLS Notes:**
- CRITICAL SENSITIVITY - Security audit data
- Users see their own audit logs
- Admins see all audit logs
- IMMUTABLE (no UPDATE policies)
- Only admins can DELETE (GDPR compliance)
- System actions have `actor_user_id = NULL`

---

### 9. property_tasks

**Purpose:** Task management for properties. Tracks to-do items, action items, and workflow tasks.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `created_by_user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `assigned_to_user_id`: UUID (NULLABLE, FK: auth.users.id, ON DELETE CASCADE)
- `title`: TEXT (NOT NULL) - Task title
- `description`: TEXT (NULLABLE) - Task details
- `status`: TEXT (NOT NULL, default: 'open') - CHECK: 'open', 'in_progress', 'awaiting_docs', 'resolved', 'cancelled'
- `priority`: TEXT (NOT NULL, default: 'medium') - CHECK: 'low', 'medium', 'high'
- `due_date`: DATE (NULLABLE) - Task due date
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())
- `updated_at`: TIMESTAMPTZ (NOT NULL, default: NOW())

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `property_id`
- INDEX on `created_by_user_id`
- INDEX on `assigned_to_user_id`
- INDEX on `status`
- INDEX on `priority`
- INDEX on `due_date` WHERE `status NOT IN ('resolved', 'cancelled')`
- COMPOSITE INDEX on (`property_id`, `status`, `due_date`)

**Relationships:**
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (created_by_user_id)
- Many-to-one: `auth.users` (assigned_to_user_id)

**RLS Notes:**
- MEDIUM SENSITIVITY - Workflow data
- Users with property access can view tasks
- Owners, admins, agents, surveyors, conveyancers can create/update tasks
- Buyers, tenants, viewers can only view

---

### 10. property_notes

**Purpose:** Notes and annotations for properties. Supports private and shared notes.

**Fields:**
- `id`: UUID (PK, default: gen_random_uuid())
- `property_id`: UUID (NOT NULL, FK: properties.id, ON DELETE CASCADE)
- `created_by_user_id`: UUID (NOT NULL, FK: auth.users.id, ON DELETE CASCADE)
- `title`: TEXT (NULLABLE) - Note title
- `content`: TEXT (NOT NULL) - Note body
- `note_type`: TEXT (NOT NULL, default: 'general') - CHECK: 'general', 'inspection', 'maintenance', 'legal', 'system'
- `is_private`: BOOLEAN (NOT NULL, default: FALSE) - Private notes only visible to elevated roles
- `pinned`: BOOLEAN (NOT NULL, default: FALSE) - Pin note to top
- `created_at`: TIMESTAMPTZ (NOT NULL, default: NOW())

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `property_id`
- INDEX on `created_by_user_id`
- INDEX on `note_type`
- INDEX on `is_private`
- INDEX on `pinned`
- COMPOSITE INDEX on (`property_id`, `pinned` DESC, `created_at` DESC) - For ordered display

**Relationships:**
- Many-to-one: `properties` (property_id)
- Many-to-one: `auth.users` (created_by_user_id)

**RLS Notes:**
- MEDIUM SENSITIVITY - May contain sensitive information
- Public notes (is_private = false) visible to all users with property access
- Private notes (is_private = true) only visible to owners, admins, agents, surveyors, conveyancers
- Only elevated roles can create/update/delete notes

---

## RELATIONSHIPS

### User → Profile
- `auth.users` (1) ←→ (1) `users_extended` via `user_id`
- One-to-one relationship
- Cascade delete: if user deleted, profile deleted

### User → Roles
- `auth.users` (1) ←→ (many) `user_property_roles` via `user_id`
- One user can have multiple roles across different properties
- One user can have multiple roles on the same property (e.g., owner + agent)

### User ↔ Property (Ownership/Access)
- `auth.users` (many) ←→ (many) `properties` via `user_property_roles`
- Many-to-many relationship
- Access determined by role in `user_property_roles`
- Property creator automatically gets `owner` role

### Property → Documents
- `properties` (1) ←→ (many) `property_documents` via `property_id`
- One property has many documents
- Cascade delete: if property deleted, all documents deleted

### Property → Media
- `properties` (1) ←→ (many) `property_media` via `property_id`
- One property has many media items
- Cascade delete: if property deleted, all media deleted

### Property → Events
- `properties` (1) ←→ (many) `property_events` via `property_id`
- Immutable event log
- Cascade delete: if property deleted, all events deleted

### Property → Flags
- `properties` (1) ←→ (many) `property_flags` via `property_id`
- One property can have multiple flags
- Cascade delete: if property deleted, all flags deleted

### Property → Tasks
- `properties` (1) ←→ (many) `property_tasks` via `property_id`
- One property has many tasks
- Cascade delete: if property deleted, all tasks deleted

### Property → Notes
- `properties` (1) ←→ (many) `property_notes` via `property_id`
- One property has many notes
- Cascade delete: if property deleted, all notes deleted

### Document → Versions
- Document versioning handled via `version` field in `property_documents`
- No separate versions table (simplified model)
- Future: could add `document_versions` table for full version history

---

## ACCESS MODEL (FOR RLS)

### Public Access (No Authentication Required)

**Properties Table:**
- Fields: `id`, `uprn`, `display_address`, `latitude`, `longitude`, `status`
- Condition: `status = 'active' AND deleted_at IS NULL`
- Purpose: Property discovery, transparency

**Property Media:**
- Featured photos only: `is_featured = true AND media_type = 'photo' AND status = 'active'`
- Purpose: Public property browsing

**External API Data:**
- EPC ratings, flood risk, HMLR price data (cached in `api_cache` table, not yet defined)
- Planning history summaries
- Crime statistics (area-level)

### Owner Access

**Full Control:**
- View/edit all property data
- Upload/delete documents and media
- Grant/revoke roles (except other owners)
- Resolve flags
- Create/update tasks and notes
- View all events and audit logs for their properties

**Access Check:**
- `is_property_owner(property_id)` helper function
- Checks `user_property_roles` for `role = 'owner'` AND `deleted_at IS NULL`

### Professional Roles (Agent, Surveyor, Conveyancer)

**Time-Bound Access:**
- Access granted via `user_property_roles` with `expires_at` date
- Must have `granted_by_user_id` (approved by owner/admin)
- Access automatically revoked when `expires_at < NOW()`

**Role-Specific Permissions:**

**Agent:**
- Upload marketing documents (floorplan, planning, warranty)
- Upload marketing photos/videos
- Update property listing fields (address, coordinates, status)
- Create tasks and notes
- View shared documents (survey, planning, warranty)

**Surveyor:**
- Upload survey documents
- Upload compliance documents
- View survey, planning, compliance, warranty documents
- Create tasks and notes

**Conveyancer:**
- Upload legal documents (title, search, identity, contract, compliance)
- View all legal documents
- View survey, planning documents
- Create tasks and notes

### Buyer Access

**Read-Only Shared Properties:**
- View property details (if explicitly granted access)
- View shared documents: survey, planning, warranty, EPC
- View all media
- View public notes (not private)
- View tasks (read-only)
- Cannot upload or edit

**Access Check:**
- `has_property_role(property_id, ARRAY['buyer'])` AND `is_within_access_window(property_id)`

### Tenant Access

**Limited Read Access:**
- View property details (if granted access)
- View safety documents: gas_safety, electrical_safety, EPC
- View all media
- View public notes
- Cannot upload or edit

### Viewer Access

**Minimal Read-Only:**
- View property details (if explicitly shared)
- View all media
- View public notes
- No document access
- No upload/edit capabilities

### Admin Access

**Full System Access:**
- Bypass all RLS policies
- View/edit all properties, documents, media
- Grant/revoke any role (including admin)
- View all audit logs
- Hard delete (permanent deletion)
- System management operations

**Access Check:**
- `is_admin()` helper function
- Checks `users_extended.primary_role = 'admin'`

---

## SECURITY NOTES

### Sensitive Tables (RESTRICTIVE Policies)

**HIGH SENSITIVITY:**
- `property_documents` - Legal, financial, identity documents
- `user_property_roles` - Access control matrix
- `audit_logs` - Security audit trail
- `users_extended` - Personal information

**MEDIUM SENSITIVITY:**
- `property_flags` - May indicate legal issues
- `property_events` - Audit trail
- `property_tasks` - Workflow data
- `property_notes` - May contain sensitive info

**LOW SENSITIVITY:**
- `properties` - Public data (address, location) but private fields exist
- `property_media` - Photos (may reveal security info)

### Document Protection

**Storage:**
- Documents stored in Supabase Storage bucket `property-documents`
- Access via signed URLs (time-limited)
- Never expose direct storage paths

**Access Control:**
- Document type determines which roles can view
- Helper function `can_access_document(document_id)` enforces access
- Owners see all documents
- Professionals see documents appropriate to their role
- Buyers see only shared documents (survey, planning, warranty)

**Document Types by Role:**
- **Title, Search, Identity, Contract**: Owner + Conveyancer only
- **Survey, Planning, Warranty**: Owner + Buyer + Agent + Surveyor + Conveyancer
- **Compliance**: Owner + Surveyor + Conveyancer
- **Gas/Electrical Safety, EPC**: Owner + Tenant + All professionals
- **Other**: Owner only

### Property Data Protection

**Public Fields:**
- Address, UPRN, location, status (active only)
- These are already public via government APIs

**Private Fields:**
- `created_by_user_id` - Who registered the property
- `deleted_at` - Soft delete status
- Full property metadata (if added in future)

**Access:**
- Public fields: Anonymous read
- Private fields: Require property role or ownership

### Cross-Property Access Prevention

**RLS Enforcement:**
- All policies check `property_id` matches user's role
- Helper functions verify `user_property_roles` for specific property
- No wildcard access - explicit grants required

**Example:**
- User A has `owner` role on Property X
- User A cannot access Property Y unless explicitly granted role
- `has_property_role(property_id, roles)` checks specific property_id

### Admin Actions

**Service Role Required:**
- Admin operations that bypass RLS must use Supabase service role key
- Service role key NEVER exposed to frontend
- Admin actions logged in `audit_logs` with `actor_user_id`

**Admin Override:**
- `is_admin()` function checks `users_extended.primary_role = 'admin'`
- Admin policies return TRUE for all operations
- Admin can hard delete (permanent deletion)
- Admin can grant any role (including admin)

**Accountability:**
- All admin actions logged
- Admin cannot delete their own audit logs
- Admin actions visible in audit trail

---

## INDEXES

### Performance Indexes

**Properties:**
- `uprn` (UNIQUE) - Fast property lookup
- `status` WHERE `deleted_at IS NULL` - Active properties filter
- `created_by_user_id` - User's properties query

**Property Documents:**
- `property_id` - Property's documents
- `document_type` - Filter by type
- `status` WHERE `deleted_at IS NULL` - Active documents

**Property Media:**
- `property_id` - Property's media
- `is_featured` WHERE `status = 'active'` - Featured photos
- `media_type` - Filter by type

**User Property Roles:**
- `(user_id, property_id, role)` (UNIQUE) - Role lookup
- `property_id` - Property's roles
- `expires_at` WHERE `expires_at IS NOT NULL` - Expiry checks
- `(property_id, deleted_at, expires_at)` - RLS performance

**Property Events:**
- `property_id` - Property's events
- `created_at` DESC - Timeline queries
- `(property_id, created_at DESC)` - Ordered timeline

**Audit Logs:**
- `actor_user_id` - User's actions
- `resource_type, resource_id` - Resource queries
- `created_at` DESC - Audit queries

### RLS Performance

**Critical Composite Indexes:**
- `user_property_roles(property_id, deleted_at, expires_at)` - Fast role checks
- `properties(status, deleted_at)` - Public property queries
- `property_documents(property_id, status, deleted_at)` - Document access

**Query Patterns:**
- Most RLS policies check `has_property_role(property_id, roles)`
- This requires efficient lookup in `user_property_roles`
- Composite indexes optimize these checks

---

## MIGRATION PREPARATION

### SQL Compatibility

**Supabase/PostgreSQL:**
- All syntax is PostgreSQL 14+ compatible
- Uses Supabase extensions: `pgcrypto` for UUID generation
- Compatible with Supabase RLS system

**UUID Generation:**
- `gen_random_uuid()` function (requires `pgcrypto` extension)
- All primary keys use UUID

**Text Enums:**
- Uses CHECK constraints instead of PostgreSQL ENUMs
- Easier to modify without migration complexity
- Example: `CHECK (status IN ('draft', 'active', 'archived'))`

**Timestamps:**
- `TIMESTAMPTZ` (timezone-aware) for all timestamps
- `NOW()` function for defaults
- Automatic `updated_at` via triggers

### Migration Sequence

**Phase 1: Extensions & Functions**
1. Create `pgcrypto` extension
2. Create `set_updated_at()` trigger function
3. Create RLS helper functions (see RLS_POLICY_PLAN.md)

**Phase 2: Core Tables**
1. `properties`
2. `users_extended`
3. `user_property_roles`

**Phase 3: Content Tables**
4. `property_documents`
5. `property_media`

**Phase 4: Workflow Tables**
6. `property_events`
7. `property_flags`
8. `property_tasks`
9. `property_notes`

**Phase 5: Audit Tables**
10. `audit_logs`

**Phase 6: Indexes**
- Create all indexes after tables
- Optimize for RLS query patterns

**Phase 7: Triggers**
- Attach `updated_at` triggers to all tables
- Create auto-owner-role trigger on property creation

**Phase 8: RLS Policies**
- Enable RLS on all tables
- Create SELECT policies
- Create INSERT policies
- Create UPDATE policies
- Create DELETE policies
- (See RLS_POLICY_PLAN.md for detailed policies)

**Phase 9: Storage Buckets**
- Create `property-documents` bucket
- Create `property-photos` bucket
- Configure bucket policies

**Phase 10: RPC Functions**
- Create helper RPCs for common queries
- Grant execute permissions

### Future Enhancements

**Potential Additions:**
- `api_cache` table for external API data caching
- `document_versions` table for full version history
- `property_metadata` table for key-value metadata
- `invitations` table for role invitation workflow
- `integrations` table for API fetch history
- `notifications` table for user notifications
- `watchlist` table for saved properties

**Not Included in MVP:**
- These tables can be added in future migrations
- Schema designed to accommodate extensions

---

## NOTES

### Implementation Details

**Soft Delete Pattern:**
- All tables use `deleted_at` for soft deletion
- Policies filter: `WHERE deleted_at IS NULL`
- Hard delete only by admins
- Preserves audit trail and history

**Time-Bound Access:**
- Professional roles use `expires_at` field
- Access automatically revoked when expired
- NULL `expires_at` = permanent access
- Owners and admins have permanent access

**Multi-Owner Support:**
- Multiple owners allowed (joint ownership)
- All owners have full control
- Owners cannot revoke other owners
- Last owner protection (application-level check)

**Document Versioning:**
- Current model: `version` field in `property_documents`
- Future: Separate `document_versions` table for full history
- Current approach: New upload = new document record

**Event Immutability:**
- `property_events` and `audit_logs` are append-only
- No UPDATE policies (except `updated_at` trigger)
- Only admins can DELETE (compliance)

**Storage Integration:**
- Documents: `property-documents` bucket
- Media: `property-photos` bucket
- Access via signed URLs (time-limited)
- Storage paths stored in `storage_path` field
- Never expose direct bucket URLs

**UPRN as Anchor:**
- Every property must have UPRN
- UPRN is UNIQUE constraint
- UPRN links to external government data
- Property discovery via UPRN lookup

**Role Hierarchy:**
- Admin > Owner > Professional Roles > Buyer > Tenant/Viewer
- Higher roles inherit lower role permissions
- Multiple roles = maximum permissions (additive)

**Creator vs Owner:**
- `created_by_user_id` = who registered property
- Auto-granted `owner` role on creation
- Creator retains access even if role revoked (fallback)
- Policies check: `is_property_owner() OR is_property_creator()`

---

## OUTPUT FORMAT SUMMARY

This specification provides:

1. ✅ **Complete table definitions** with all fields, types, constraints
2. ✅ **Relationship mappings** between all entities
3. ✅ **Access model specification** for RLS implementation
4. ✅ **Security notes** for sensitive data protection
5. ✅ **Index strategy** for performance optimization
6. ✅ **Migration preparation** with SQL compatibility notes

**Ready for:**
- SQL migration generation
- RLS policy implementation
- Application layer development
- Testing strategy definition

**Next Steps:**
1. Review and approve this specification
2. Generate SQL migrations from this spec
3. Implement RLS policies (see RLS_POLICY_PLAN.md)
4. Create test data and scenarios
5. Performance testing and optimization

---

**END OF SCHEMA SPECIFICATION**

This document serves as the authoritative blueprint for the Property Passport UK v7.0 database schema. All SQL migrations should align with this specification.

