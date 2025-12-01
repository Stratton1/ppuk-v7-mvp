/**
 * File: revoke-property-role.ts
 * Purpose: Server action for revoking property access roles (v7 owner/editor/viewer)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export type RevokeRoleResult = { success: true } | { success: false; error: string };

export async function revokePropertyRole(
  propertyId: string,
  userId: string,
  role: Database['public']['Enums']['property_role_type']
): Promise<RevokeRoleResult> {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Authentication required' };

    const { error: revokeError } = await supabase.rpc('revoke_property_role', {
      target_user_id: userId,
      property_id: propertyId,
      role,
    } satisfies Database['public']['Functions']['revoke_property_role']['Args']);

    if (revokeError) {
      console.error('Role revoke error:', revokeError);
      return { success: false, error: revokeError.message };
    }

    await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'updated',
      event_payload: {
        action: 'role_revoked',
        role,
        revoked_from_user_id: userId,
      },
    });

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
  } catch (error) {
    console.error('Unexpected role revoke error:', error);
    return { success: false, error: 'Unexpected error revoking role' };
  }
}
