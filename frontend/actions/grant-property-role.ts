/**
 * File: grant-property-role.ts
 * Purpose: Server action for granting property access roles (v7 owner/editor/viewer)
 */

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

const STATUSES = ['owner', 'buyer', 'tenant'] as const;
const PERMISSIONS = ['editor', 'viewer'] as const;

const GrantRoleSchema = z.object({
  email: z.string().email('Invalid email address'),
  status: z.enum(STATUSES).optional().nullable(),
  permission: z.enum(PERMISSIONS),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
});

export type GrantRoleResult = { success: true } | { success: false; error: string };

export async function grantPropertyRole(propertyId: string, formData: FormData): Promise<GrantRoleResult> {
  try {
    const supabase = createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Authentication required to grant access' };
    }

    const rawStatus = formData.get('status');
    const statusValue = rawStatus ? rawStatus.toString() : null;

    const parse = GrantRoleSchema.safeParse({
      email: formData.get('email'),
      status: statusValue,
      permission: formData.get('permission'),
      expiresAt: formData.get('expiresAt'),
      notes: formData.get('notes'),
    });
    if (!parse.success) {
      return { success: false, error: parse.error.issues[0]?.message || 'Invalid input' };
    }
    const { email, status, permission, expiresAt, notes } = parse.data;

    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, full_name, primary_role')
      .eq('email', email)
      .single();
    if (userError || !targetUser) {
      return { success: false, error: 'User not found for that email' };
    }

    const effectiveStatus = targetUser.primary_role === 'consumer' ? status ?? null : null;
    const normalizedPermission =
      effectiveStatus === 'owner' && permission === 'viewer' ? 'editor' : permission;
    const expiresAtIso = expiresAt ? new Date(expiresAt).toISOString() : null;

    const { error: grantError } = await supabase.rpc('grant_property_role', {
      target_user_id: targetUser.id,
      property_id: propertyId,
      status: effectiveStatus ?? undefined,
      permission: normalizedPermission,
      expires_at: expiresAtIso ?? undefined,
    } satisfies Database['public']['Functions']['grant_property_role']['Args']);

    if (grantError) {
      console.error('Role grant error:', grantError);
      return { success: false, error: grantError.message };
    }

    await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'updated',
      event_payload: {
        action: 'access_granted',
        status: effectiveStatus ?? null,
        permission: normalizedPermission,
        granted_to_user_id: targetUser.id,
        granted_to_name: targetUser.full_name,
        expires_at: expiresAtIso,
        notes: notes || null,
      },
    });

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
  } catch (error) {
    console.error('Unexpected role grant error:', error);
    return { success: false, error: 'Unexpected error granting role' };
  }
}
