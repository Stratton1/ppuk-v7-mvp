# RLS Architecture (PPUK v7)

Authoritative description of helper functions, roles, and table-level policies as implemented in the latest Supabase migrations (roles/status/permission refactor).

## Helper Functions
- `is_service_role()`: true when JWT role is `service_role`.
- `is_admin()`: true when `users.primary_role = 'admin'`.
- Property role helpers (all security definer):
  - `role_for_property(property_id)`: resolves effective permission (`editor`/`viewer`) based on stakeholder rows, ownership, admin/service.
  - `is_property_owner(property_id, user_id=auth.uid())`: creator or stakeholder with status `owner`.
  - `is_property_buyer(property_id, user_id)`: stakeholder status `buyer`.
  - `is_property_tenant(property_id, user_id)`: stakeholder status `tenant`.
  - `is_property_editor(property_id, user_id)`: owner/admin/service or stakeholder permission `editor`.
  - `is_property_viewer(property_id, user_id)`: admin/service, public visibility, owner, editor, viewer, buyer, or tenant.
  - `has_property_role(property_id, allowed_roles[], user_id)`: true if user matches status/permission in allowed roles, or admin/service, or creator (for owner).
  - Convenience wrappers: `can_edit_property`, `can_view_property`, `can_upload`, `can_delete`, `can_invite`.

## Role Model
- **Global primary_role (users)**: `consumer`, `agent`, `conveyancer`, `surveyor`, `admin` (admin elevated).
- **Per-property**:
  - Status: `owner`, `buyer`, `tenant`.
  - Permission: `editor`, `viewer`.
  - Compatibility `role` column remains (`owner`/`editor`/`viewer`) on `property_stakeholders`/`invitations`.

## Policy Overview (by table)
- **properties**:  
  - `SELECT`: `can_view_property(id)`.  
  - `ALL (insert/update/delete)`: `can_edit_property(id)`.
- **property_stakeholders**:  
  - `SELECT`: stakeholder themselves or `can_invite(property_id)` (owners/admin).  
  - `ALL`: `can_invite(property_id)`.
- **documents**:  
  - `SELECT`: `can_view_property(property_id)`.  
  - `ALL`: `can_upload(property_id)` (editor/owner/admin/service).
- **media**:  
  - `SELECT`: `can_view_property(property_id)`.  
  - `ALL`: `can_upload(property_id)`.
- **tasks**:  
  - `SELECT`: `can_view_property(property_id)`.  
  - `ALL`: `can_edit_property(property_id)`.
- **property_events**:  
  - `SELECT`: `can_view_property(property_id)`.  
  - `INSERT`: `can_edit_property(property_id)`.
- **property_metadata**:  
  - `SELECT`: `can_view_property(property_id)`.  
  - `ALL`: `can_edit_property(property_id)`.
- **invitations**:  
  - `SELECT`: `can_invite(property_id)` or email matches current user.  
  - `ALL`: `can_invite(property_id)`.
- **profiles**:  
  - `SELECT/UPDATE`: self, admin, or service.
- **notifications**:  
  - `SELECT`: self, admin, or service.
- **activity_log**:  
  - `SELECT`: admin or service.
- **integrations**:  
  - `SELECT`: property is null or `can_view_property(property_id)`;  
  - `ALL`: property is null or `can_invite(property_id)`.

## Public Access
- Public property visibility controlled via `properties.public_visibility` and `set_public_visibility` RPC. `can_view_property` allows public reads for properties marked visible, but document/media policies still require authenticated viewers; storage policies must align (see storage section in migrations).

## RPCs and RLS
- Key RPCs are security definer and rely on helpers: `create_property_with_role`, `update_property_with_event`, `search_properties`, `get_user_properties`, `get_recent_activity`, `get_dashboard_stats`, `calculate_property_completion`, `get_public_property`, `grant_property_role`, `revoke_property_role`, `invite_user_to_property`, `accept_invitation`, `set_public_visibility`, `regenerate_slug`.
- RPC security assumes RLS as above; client code should not bypass with service keys.

## Notes for Maintainers
- Keep `role-utils.ts` in frontend aligned with these SQL helpers to avoid drift.
- When adding new tables, follow the pattern: helper-based policies with explicit select/write separation and public visibility checks only where intentional.
- Update Supabase generated types after any migration that changes enums/tables/functions.
