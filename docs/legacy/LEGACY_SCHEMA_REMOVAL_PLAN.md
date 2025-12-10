Deprecated planning doc; kept for history. Refer to `docs/architecture/SCHEMA_ARCHITECTURE_SPECIFICATION.md` and current migrations instead.
# Legacy Schema Removal Plan (v6 → v7)

**Version:** 1.0  
**Date:** January 2025  
**Status:** PLANNING  
**Purpose:** Safely remove legacy v6 tables and migrate to v7 schema

---

## EXECUTIVE SUMMARY

This plan outlines the safe removal of legacy v6 database tables that have been replaced by the new v7 schema. The v7 migration (`20250101000000_ppuk_v7_schema.sql`) created new tables with improved structure, but legacy tables remain in the database. This plan ensures:

1. **Data preservation** - No data loss during migration
2. **Dependency resolution** - All foreign keys and references handled
3. **Code alignment** - Application code updated to use new tables
4. **Zero downtime** - Migration can be done incrementally

---

## 1. TABLES TO DROP

### 1.1 Legacy Tables (v6)

| Legacy Table | Status | Replacement (v7) | Notes |
|--------------|--------|-------------------|-------|
| `property_documents` | ✅ Replaceable | `documents` | Direct replacement, same functionality |
| `property_media` | ✅ Replaceable | `media` | Direct replacement, same functionality |
| `users_extended` | ✅ Replaceable | `users` + `profiles` | Split into two tables in v7 |
| `user_property_roles` | ✅ Replaceable | `property_stakeholders` | Direct replacement, same functionality |
| `property_events` | ⚠️ **CONFLICT** | `property_events` | **Table exists in both schemas** - needs merge |
| `properties` | ⚠️ **CONFLICT** | `properties` | **Table exists in both schemas** - needs merge |
| `property_flags` | ❌ No replacement | N/A | **No v7 equivalent** - decide: drop or keep |
| `property_tasks` | ⚠️ **CONFLICT** | `tasks` | Different structure - needs migration |
| `property_notes` | ❌ No replacement | N/A | **No v7 equivalent** - decide: drop or keep |
| `audit_logs` | ⚠️ **CONFLICT** | `activity_log` | Renamed in v7 - needs migration |

### 1.2 Table-by-Table Analysis

#### ✅ **property_documents → documents**

**Functionality Match:** 100% - Direct replacement

**Schema Differences:**
- Legacy: `document_type` uses CHECK constraint (text)
- v7: `document_type` uses ENUM type
- Legacy: `uploaded_by_user_id` references `auth.users`
- v7: `uploaded_by_user_id` references `public.users`

**Migration Required:**
- Data migration from `property_documents` → `documents`
- Update foreign key references
- Map document_type values (should be identical)

**Drop Safe:** ✅ Yes, after data migration

---

#### ✅ **property_media → media**

**Functionality Match:** 100% - Direct replacement

**Schema Differences:**
- Legacy: `media_type` uses CHECK constraint (text)
- v7: `media_type` uses ENUM type
- Legacy: `uploaded_by_user_id` references `auth.users`
- v7: `uploaded_by_user_id` references `public.users`
- v7 adds: `is_featured`, `sort_order` (new features)

**Migration Required:**
- Data migration from `property_media` → `media`
- Update foreign key references
- Map media_type values (should be identical)

**Drop Safe:** ✅ Yes, after data migration

---

#### ✅ **users_extended → users + profiles**

**Functionality Match:** 95% - Split into two tables

**Schema Differences:**
- Legacy: Single table with all user data
- v7: Split into `users` (core) + `profiles` (extended)
- Legacy: `user_id` references `auth.users`
- v7: `users.id` references `auth.users` (PK), `profiles.user_id` references `users.id`

**Field Mapping:**
```
users_extended.user_id → users.id (PK)
users_extended.full_name → users.full_name
users_extended.avatar_url → users.avatar_url
users_extended.organisation → users.organisation
users_extended.primary_role → users.primary_role
users_extended.phone → profiles.phone
users_extended.bio → profiles.bio (new field)
```

**Migration Required:**
- Split data into `users` and `profiles` tables
- Update all foreign key references from `users_extended.user_id` to `users.id`

**Drop Safe:** ✅ Yes, after data migration

---

#### ✅ **user_property_roles → property_stakeholders**

**Functionality Match:** 100% - Direct replacement

**Schema Differences:**
- Legacy: `role` uses CHECK constraint (text)
- v7: `role` uses ENUM type (`role_type`)
- Legacy: `id` UUID primary key
- v7: Composite primary key `(user_id, property_id, role)`
- Legacy: `granted_by_user_id` references `auth.users`
- v7: `granted_by_user_id` references `public.users`

**Migration Required:**
- Data migration from `user_property_roles` → `property_stakeholders`
- Update foreign key references
- Map role values (should be identical)

**Drop Safe:** ✅ Yes, after data migration

---

#### ⚠️ **property_events (CONFLICT)**

**Status:** Table exists in both schemas

**Schema Differences:**
- Legacy: `event_type` uses CHECK constraint (text)
- v7: `event_type` uses ENUM type (`event_type`)
- Legacy: `actor_user_id` references `auth.users`
- v7: `actor_user_id` references `public.users`

**Action Required:**
- **Option A:** Merge data from legacy table into v7 table (if any exists)
- **Option B:** Drop legacy table if v7 table already has all data
- **Option C:** Keep both temporarily, migrate data, then drop legacy

**Drop Safe:** ⚠️ Conditional - depends on data state

---

#### ⚠️ **properties (CONFLICT)**

**Status:** Table exists in both schemas

**Schema Differences:**
- Legacy: `status` uses CHECK constraint (text)
- v7: `status` uses ENUM type (`property_status`)
- Legacy: `created_by_user_id` references `auth.users`
- v7: `created_by_user_id` references `public.users`
- v7 adds: `public_slug`, `public_visibility` (new features)

**Action Required:**
- **Option A:** Migrate data from legacy to v7 (if schema differs)
- **Option B:** Keep v7 table, drop legacy triggers/constraints
- **Option C:** Alter legacy table to match v7 structure

**Drop Safe:** ⚠️ Conditional - v7 table already exists, legacy may be empty

---

#### ❌ **property_flags (NO REPLACEMENT)**

**Status:** No v7 equivalent table

**Decision Required:**
- **Option A:** Keep `property_flags` (add to v7 schema)
- **Option B:** Drop `property_flags` (functionality not needed)
- **Option C:** Migrate to `property_metadata` (key-value store)

**Recommendation:** Keep for now, add to v7 schema if needed

**Drop Safe:** ❌ No - functionality would be lost

---

#### ⚠️ **property_tasks → tasks**

**Functionality Match:** 90% - Similar but different structure

**Schema Differences:**
- Legacy: Uses `has_property_role()` RLS helper
- v7: Uses `is_property_stakeholder()` RLS helper
- Legacy: `created_by_user_id` references `auth.users`
- v7: `created_by_user_id` references `public.users`
- v7 adds: `deleted_at` (soft delete support)

**Migration Required:**
- Data migration from `property_tasks` → `tasks`
- Update RLS policies to use new helper functions
- Update foreign key references

**Drop Safe:** ✅ Yes, after data migration

---

#### ❌ **property_notes (NO REPLACEMENT)**

**Status:** No v7 equivalent table

**Decision Required:**
- **Option A:** Keep `property_notes` (add to v7 schema)
- **Option B:** Drop `property_notes` (functionality not needed)
- **Option C:** Migrate to `property_metadata` (key-value store)

**Recommendation:** Keep for now, add to v7 schema if needed

**Drop Safe:** ❌ No - functionality would be lost

---

#### ⚠️ **audit_logs → activity_log**

**Functionality Match:** 100% - Renamed only

**Schema Differences:**
- Legacy: `actor_user_id` references `auth.users`
- v7: `actor_user_id` references `public.users`
- Table name changed: `audit_logs` → `activity_log`

**Migration Required:**
- Data migration from `audit_logs` → `activity_log`
- Update foreign key references
- Update code references to new table name

**Drop Safe:** ✅ Yes, after data migration

---

## 2. DEPENDENCIES

### 2.1 Foreign Key Dependencies

**Tables that reference legacy tables:**

| Referencing Table | References | Action Required |
|-------------------|------------|-----------------|
| `property_documents` | `properties.id`, `auth.users.id` | Update to `documents` + `public.users.id` |
| `property_media` | `properties.id`, `auth.users.id` | Update to `media` + `public.users.id` |
| `user_property_roles` | `properties.id`, `auth.users.id` | Update to `property_stakeholders` + `public.users.id` |
| `property_events` | `properties.id`, `auth.users.id` | Update to `public.users.id` (if merging) |
| `property_flags` | `properties.id`, `auth.users.id` | Keep or migrate |
| `property_tasks` | `properties.id`, `auth.users.id` | Update to `tasks` + `public.users.id` |
| `property_notes` | `properties.id`, `auth.users.id` | Keep or migrate |

### 2.2 RPC Function Dependencies

**Functions that reference legacy tables:**

| Function | References | Status |
|----------|------------|--------|
| `has_property_role()` | `user_property_roles` | ⚠️ Needs update to `property_stakeholders` |
| `is_property_owner()` | `user_property_roles` | ⚠️ Needs update to `property_stakeholders` |
| `get_property_tasks()` | `property_tasks` | ⚠️ Needs update to `tasks` |
| `get_property_notes()` | `property_notes` | ⚠️ Keep or update |
| `featured_media_rpc()` | `property_media` | ⚠️ Needs update to `media` |
| `property_create_rpc()` | `properties`, `user_property_roles` | ⚠️ Needs update |
| `get_user_properties_rpc()` | `user_property_roles` | ⚠️ Needs update to `property_stakeholders` |

**Action Required:**
- Update all RPC functions to use new table names
- Update RLS helper functions to use `property_stakeholders`
- Test all RPC functions after migration

### 2.3 Trigger Dependencies

**Triggers on legacy tables:**

| Trigger | Table | Action Required |
|---------|-------|-----------------|
| `set_updated_at_property_documents` | `property_documents` | Drop (replaced by `documents_set_updated_at`) |
| `set_updated_at_property_media` | `property_media` | Drop (replaced by `media_set_updated_at`) |
| `set_updated_at_users_extended` | `users_extended` | Drop (replaced by `users_set_updated_at`, `profiles_set_updated_at`) |
| `set_updated_at_user_property_roles` | `user_property_roles` | Drop (replaced by `property_stakeholders_set_updated_at`) |
| `set_updated_at_property_events` | `property_events` | Keep or update (if merging) |
| `set_updated_at_property_flags` | `property_flags` | Keep (if keeping table) |
| `set_updated_at_property_tasks` | `property_tasks` | Drop (replaced by `tasks_set_updated_at`) |
| `set_updated_at_audit_logs` | `audit_logs` | Drop (replaced by `activity_log_set_updated_at`) |

### 2.4 RLS Policy Dependencies

**Policies on legacy tables:**

All legacy tables have RLS policies that must be:
1. **Dropped** when tables are dropped
2. **Replaced** by v7 RLS policies (already in `20250101000100_ppuk_v7_rls_policies.sql`)

**Action Required:**
- Drop all legacy RLS policies before dropping tables
- Ensure v7 RLS policies are applied first

---

## 3. CODE REFERENCES TO UPDATE

### 3.1 Frontend Action Files

| File | Legacy Reference | Update To |
|------|------------------|-----------|
| `actions/upload-property-document.ts` | `property_documents` | `documents` |
| `actions/delete-property-document.ts` | `property_documents` | `documents` |
| `actions/upload-property-photo.ts` | `property_media` | `media` |
| `actions/delete-property-media.ts` | `property_media` | `media` |
| `actions/grant-property-role.ts` | `user_property_roles`, `users_extended` | `property_stakeholders`, `users` |
| `actions/revoke-property-role.ts` | `user_property_roles` | `property_stakeholders` |
| `actions/tasks.ts` | `property_tasks` | `tasks` |

### 3.2 Frontend Component Files

| File | Legacy Reference | Update To |
|------|------------------|-----------|
| `components/property/property-documents.tsx` | `property_documents` | `documents` |
| `components/property/property-gallery.tsx` | `property_media` | `media` |
| `components/property/gallery-image.tsx` | `property_media` | `media` |
| `components/property/property-access.tsx` | `user_property_roles`, `users_extended` | `property_stakeholders`, `users` |
| `components/property/property-events.tsx` | `property_events` | `property_events` (same name) |
| `components/property/property-flags.tsx` | `property_flags` | Keep or remove |
| `components/property/tasks/task-list.tsx` | `property_tasks` | `tasks` |
| `components/property/tasks/create-task-dialog.tsx` | `property_tasks` | `tasks` |
| `components/property/notes/note-list.tsx` | `property_notes` | Keep or remove |
| `components/property/notes/create-note-dialog.tsx` | `property_notes` | Keep or remove |
| `components/dashboard/recent-activity.tsx` | `property_events` | `property_events` (same name) |

### 3.3 TypeScript Type Definitions

| File | Legacy Reference | Update To |
|------|------------------|-----------|
| `types/supabase.ts` | All legacy table types | Regenerate from v7 schema |

**Action Required:**
- Run `supabase gen types typescript --linked > frontend/types/supabase.ts`
- Update all type imports in code

### 3.4 Utility Files

| File | Legacy Reference | Update To |
|------|------------------|-----------|
| `lib/document-utils.ts` | `property_documents` | `documents` |
| `lib/role-utils.ts` | `user_property_roles` | `property_stakeholders` |

### 3.5 RPC Function Calls

**Code that calls RPC functions:**

| RPC Function | Legacy Table | Update To |
|--------------|-------------|-----------|
| `has_property_role()` | `user_property_roles` | Update function to use `property_stakeholders` |
| `get_property_tasks()` | `property_tasks` | Update function to use `tasks` |
| `get_property_notes()` | `property_notes` | Keep or remove |

---

## 4. DROP ORDER

### 4.1 Dependency Graph

```
Level 1 (No dependencies):
├── property_documents (depends on: properties, auth.users)
├── property_media (depends on: properties, auth.users)
├── property_flags (depends on: properties, auth.users)
├── property_tasks (depends on: properties, auth.users)
├── property_notes (depends on: properties, auth.users)
└── audit_logs (depends on: auth.users)

Level 2 (Depends on Level 1):
├── user_property_roles (depends on: properties, auth.users)
└── users_extended (depends on: auth.users)

Level 3 (Depends on Level 2):
└── property_events (depends on: properties, auth.users)

Level 4 (Root):
└── properties (CONFLICT - exists in both schemas)
```

### 4.2 Safe Drop Sequence

**Phase 1: Drop Leaf Tables (No FKs pointing to them)**
1. `property_documents` → After migrating to `documents`
2. `property_media` → After migrating to `media`
3. `property_flags` → After decision (keep/drop/migrate)
4. `property_tasks` → After migrating to `tasks`
5. `property_notes` → After decision (keep/drop/migrate)
6. `audit_logs` → After migrating to `activity_log`

**Phase 2: Drop Intermediate Tables**
7. `user_property_roles` → After migrating to `property_stakeholders`
8. `users_extended` → After migrating to `users` + `profiles`

**Phase 3: Drop/Resolve Conflict Tables**
9. `property_events` → After merging/verifying data
10. `properties` → **DO NOT DROP** - Keep v7 version, drop legacy triggers/constraints only

### 4.3 Detailed Drop Script Order

```sql
-- Phase 1: Drop RLS policies first
DROP POLICY IF EXISTS ... ON property_documents;
DROP POLICY IF EXISTS ... ON property_media;
DROP POLICY IF EXISTS ... ON user_property_roles;
DROP POLICY IF EXISTS ... ON users_extended;
DROP POLICY IF EXISTS ... ON property_tasks;
DROP POLICY IF EXISTS ... ON property_notes;
DROP POLICY IF EXISTS ... ON property_flags;
DROP POLICY IF EXISTS ... ON audit_logs;

-- Phase 2: Drop triggers
DROP TRIGGER IF EXISTS set_updated_at_property_documents ON property_documents;
DROP TRIGGER IF EXISTS set_updated_at_property_media ON property_media;
DROP TRIGGER IF EXISTS set_updated_at_user_property_roles ON user_property_roles;
DROP TRIGGER IF EXISTS set_updated_at_users_extended ON users_extended;
DROP TRIGGER IF EXISTS set_updated_at_property_tasks ON property_tasks;
DROP TRIGGER IF EXISTS set_updated_at_audit_logs ON audit_logs;

-- Phase 3: Drop RPC functions that reference legacy tables
DROP FUNCTION IF EXISTS get_property_tasks(uuid);
DROP FUNCTION IF EXISTS get_property_notes(uuid);
-- Note: has_property_role() will be updated, not dropped

-- Phase 4: Drop tables (in dependency order)
DROP TABLE IF EXISTS property_documents CASCADE;
DROP TABLE IF EXISTS property_media CASCADE;
DROP TABLE IF EXISTS property_tasks CASCADE;
DROP TABLE IF EXISTS property_notes CASCADE; -- If dropping
DROP TABLE IF EXISTS property_flags CASCADE; -- If dropping
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_property_roles CASCADE;
DROP TABLE IF EXISTS users_extended CASCADE;
DROP TABLE IF EXISTS property_events CASCADE; -- If merging

-- Phase 5: Clean up legacy properties table (if needed)
-- Only drop legacy triggers/constraints, keep table structure
-- Or alter table to match v7 structure
```

---

## 5. FINAL CLEAN SCHEMA STATE

### 5.1 v7 Tables (Final State)

**Core Tables:**
- ✅ `users` (replaces `users_extended`)
- ✅ `profiles` (new, split from `users_extended`)
- ✅ `roles` (new, role catalog)
- ✅ `user_roles` (new, global roles)
- ✅ `properties` (merged/updated from legacy)
- ✅ `property_stakeholders` (replaces `user_property_roles`)
- ✅ `documents` (replaces `property_documents`)
- ✅ `document_versions` (new, version history)
- ✅ `media` (replaces `property_media`)
- ✅ `tasks` (replaces `property_tasks`)
- ✅ `property_events` (merged/updated from legacy)
- ✅ `property_metadata` (new, key-value store)
- ✅ `notifications` (new)
- ✅ `activity_log` (replaces `audit_logs`)
- ✅ `integrations` (new, API cache)
- ✅ `invitations` (new)

**Optional Tables (Decision Required):**
- ⚠️ `property_flags` (keep or drop)
- ⚠️ `property_notes` (keep or add to v7)

### 5.2 v7 Enums (Final State)

- ✅ `role_type` enum
- ✅ `property_status` enum
- ✅ `document_type` enum
- ✅ `media_type` enum
- ✅ `event_type` enum
- ✅ `notification_type` enum
- ✅ `invitation_status` enum
- ✅ `integration_type` enum

### 5.3 v7 Functions (Final State)

- ✅ `update_timestamp()` trigger function
- ✅ `is_service_role()` RLS helper
- ✅ `is_property_stakeholder()` RLS helper
- ✅ `is_property_owner()` RLS helper

### 5.4 v7 RLS Policies (Final State)

All tables have RLS enabled with appropriate policies (from `20250101000100_ppuk_v7_rls_policies.sql`)

---

## 6. MIGRATION CHECKLIST

### Pre-Migration

- [ ] Backup database
- [ ] Verify v7 tables exist and are populated (if any)
- [ ] Verify v7 RLS policies are applied
- [ ] Document current data counts in legacy tables
- [ ] Test v7 schema with sample data

### Data Migration

- [ ] Migrate `property_documents` → `documents`
- [ ] Migrate `property_media` → `media`
- [ ] Migrate `users_extended` → `users` + `profiles`
- [ ] Migrate `user_property_roles` → `property_stakeholders`
- [ ] Migrate `property_tasks` → `tasks`
- [ ] Migrate `audit_logs` → `activity_log`
- [ ] Merge `property_events` (if needed)
- [ ] Decide on `property_flags` (keep/drop/migrate)
- [ ] Decide on `property_notes` (keep/drop/migrate)

### Code Updates

- [ ] Update all action files
- [ ] Update all component files
- [ ] Update utility files
- [ ] Regenerate TypeScript types
- [ ] Update RPC function calls
- [ ] Update RLS helper functions

### RPC Function Updates

- [ ] Update `has_property_role()` to use `property_stakeholders`
- [ ] Update `is_property_owner()` to use `property_stakeholders`
- [ ] Update `get_property_tasks()` to use `tasks`
- [ ] Update `get_property_notes()` (if keeping)
- [ ] Update `featured_media_rpc()` to use `media`
- [ ] Update `property_create_rpc()` to use new tables
- [ ] Update `get_user_properties_rpc()` to use `property_stakeholders`

### Testing

- [ ] Test document upload/download
- [ ] Test media upload/view
- [ ] Test role granting/revoking
- [ ] Test property creation
- [ ] Test task creation/updates
- [ ] Test RLS policies
- [ ] Test RPC functions
- [ ] End-to-end user workflows

### Cleanup

- [ ] Drop legacy RLS policies
- [ ] Drop legacy triggers
- [ ] Drop legacy RPC functions (after updating)
- [ ] Drop legacy tables
- [ ] Verify no orphaned data
- [ ] Update documentation

---

## 7. RISK ASSESSMENT

### High Risk

- **Data Loss:** If migration scripts fail mid-process
  - **Mitigation:** Full database backup before migration
  - **Mitigation:** Test migration on staging first

- **Foreign Key Violations:** If data migration incomplete
  - **Mitigation:** Validate all foreign keys after migration
  - **Mitigation:** Use transactions for atomicity

### Medium Risk

- **RLS Policy Gaps:** If policies not properly migrated
  - **Mitigation:** Test all access patterns after migration
  - **Mitigation:** Review v7 RLS policies match requirements

- **Code References:** If code not fully updated
  - **Mitigation:** Comprehensive code search and replace
  - **Mitigation:** TypeScript compilation will catch type errors

### Low Risk

- **Performance:** Temporary performance impact during migration
  - **Mitigation:** Run during low-traffic period
  - **Mitigation:** Monitor query performance

---

## 8. DECISION POINTS

### 8.1 property_flags

**Options:**
- **A)** Keep table, add to v7 schema officially
- **B)** Drop table, remove functionality
- **C)** Migrate to `property_metadata` (key-value)

**Recommendation:** Option A - Keep and add to v7 schema

### 8.2 property_notes

**Options:**
- **A)** Keep table, add to v7 schema officially
- **B)** Drop table, remove functionality
- **C)** Migrate to `property_metadata` (key-value)

**Recommendation:** Option A - Keep and add to v7 schema

### 8.3 properties Table Conflict

**Options:**
- **A)** Keep v7 table, drop legacy triggers/constraints
- **B)** Migrate data from legacy to v7, then drop legacy
- **C)** Alter legacy table to match v7 structure

**Recommendation:** Option A - v7 table already exists, verify data, drop legacy constraints

### 8.4 property_events Table Conflict

**Options:**
- **A)** Merge data from legacy to v7 (if any exists)
- **B)** Keep v7 table, drop legacy (if empty)
- **C)** Keep both temporarily, migrate incrementally

**Recommendation:** Option B - v7 table already exists, verify no data loss, drop legacy

---

## 9. ESTIMATED EFFORT

| Task | Estimated Time | Complexity |
|------|----------------|------------|
| Data migration scripts | 4-6 hours | Medium |
| Code updates (actions) | 2-3 hours | Low |
| Code updates (components) | 3-4 hours | Medium |
| RPC function updates | 2-3 hours | Medium |
| TypeScript type regeneration | 0.5 hours | Low |
| Testing | 4-6 hours | High |
| Documentation updates | 1-2 hours | Low |
| **Total** | **16-24 hours** | **Medium-High** |

---

## 10. NEXT STEPS

1. **Review and approve this plan**
2. **Make decisions on property_flags and property_notes**
3. **Create data migration scripts**
4. **Update code references incrementally**
5. **Test on staging environment**
6. **Apply to production with rollback plan**
7. **Monitor for issues post-migration**

---

**END OF LEGACY SCHEMA REMOVAL PLAN**

This plan provides a comprehensive roadmap for safely removing legacy v6 tables and completing the migration to v7 schema. All SQL generation should be done by Codex based on this specification.
