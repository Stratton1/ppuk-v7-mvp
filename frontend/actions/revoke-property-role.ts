/**
 * File: revoke-property-role.ts
 * Purpose: Server action for revoking property access roles
 * Type: Server Action
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Revoke result type
 */
export type RevokeRoleResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server action to revoke property access role from a user
 * 
 * Steps:
 * 1. Validate authentication
 * 2. Check user has permission to revoke roles (owner or admin)
 * 3. Fetch role details for event logging
 * 4. Delete role from property_stakeholders
 * 5. Log role_revoked event
 * 6. Revalidate property page
 * 
 * @param roleId - property_stakeholders ID to revoke
 * @param propertyId - Property ID (for revalidation and permission check)
 */
export async function revokePropertyRole(
  roleId: string,
  propertyId: string
): Promise<RevokeRoleResult> {
  try {
    // Create Supabase client (server-side)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to revoke access' };
    }

    // Check if user has permission to revoke roles (owner or admin only)
    const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
      property_id: propertyId,
      allowed_roles: ['owner', 'admin'],
    };
    const { data: hasPermission, error: permissionError } = await supabase.rpc(
      'has_property_role',
      hasPropertyRoleArgs
    );

    if (permissionError) {
      console.error('Permission check error:', permissionError);
      return { success: false, error: 'Failed to verify permissions' };
    }

    if (!hasPermission) {
      return {
        success: false,
        error: 'You do not have permission to revoke access for this property',
      };
    }

    // Fetch role details before deletion (for event logging)
    const { data: role, error: fetchError } = await supabase
      .from('property_stakeholders')
      .select('user_id, role, granted_by_user_id')
      .eq('id', roleId)
      .single();

    if (fetchError || !role) {
      console.error('Role fetch error:', fetchError);
      return { success: false, error: 'Role not found' };
    }

    // Prevent revoking owner role
    if (role.role === 'owner') {
      return {
        success: false,
        error: 'Cannot revoke owner role. Transfer ownership instead.',
      };
    }

    // Get user name for event log
    const { data: targetUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('user_id', role.user_id)
      .single();

    // Delete the role
    const { error: deleteError } = await supabase
      .from('property_stakeholders')
      .delete()
      .eq('id', roleId);

    if (deleteError) {
      console.error('Role delete error:', deleteError);
      return { success: false, error: `Failed to revoke role: ${deleteError.message}` };
    }

    // Log role_revoked event
    const { error: eventError } = await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'status_changed', // Using 'status_changed' as 'role_revoked' might not be in schema
      event_payload: {
        action: 'role_revoked',
        role: role.role,
        revoked_from_user_id: role.user_id,
        revoked_from_name: targetUser?.full_name || 'Unknown',
      },
    });

    if (eventError) {
      console.error('Event logging error:', eventError);
      // Don't fail the revocation if event logging fails
    }

    // Revalidate the property page
    revalidatePath(`/properties/${propertyId}`);

    return { success: true };
  } catch (error: unknown) {
    console.error('Unexpected error during role revocation:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
