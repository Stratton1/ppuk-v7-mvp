"use server";

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ActionResult } from '@/types/forms';
import type { Database } from '@/types/supabase';

const InvitationPayloadSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  inviteeEmail: z.string().email('Valid email required').trim().toLowerCase(),
  permission: z.custom<Database['public']['Enums']['property_permission_type']>((val) =>
    typeof val === 'string' ? ['editor', 'viewer'].includes(val) : false
  , { message: 'Invalid permission' }),
});

export async function sendPropertyInvitationAction({
  propertyId,
  inviteeEmail,
  permission,
}: {
  propertyId: string;
  inviteeEmail: string;
  permission: Database['public']['Enums']['property_permission_type'];
}): Promise<ActionResult> {
  const parsed = InvitationPayloadSchema.safeParse({ propertyId, inviteeEmail, permission });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const input = parsed.data;
  const supabase = createActionClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitationPayload: Database['public']['Tables']['invitations']['Insert'] = {
    email: input.inviteeEmail,
    property_id: input.propertyId,
    property_permission: input.permission,
    role: input.permission === 'editor' ? 'editor' : 'viewer',
    status: 'pending',
    token: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    expires_at: expiresAt.toISOString(),
  };

  const { error } = await supabase.from('invitations').insert(invitationPayload).select('id').single();
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/properties/${input.propertyId}`);
  return { success: true };
}

export async function removeStakeholderAction(
  userIdOrInvitationId: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  // Try to remove from property_stakeholders first
  const { error: stakeholderError } = await supabase
    .from('property_stakeholders')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', userIdOrInvitationId)
    .eq('property_id', propertyId);

  // If that didn't work, try removing the invitation
  if (stakeholderError) {
    const { error: invitationError } = await supabase
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', userIdOrInvitationId)
      .eq('property_id', propertyId);

    if (invitationError) {
      return { error: invitationError.message };
    }
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function resendInvitationAction(
  invitationId: string
): Promise<ActionResult> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  // Get the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('invitations')
    .select('id, email, property_id, expires_at')
    .eq('id', invitationId)
    .single();

  if (fetchError || !invitation) {
    return { error: 'Invitation not found' };
  }

  // Update the expiration date to extend it
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days from now

  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      expires_at: newExpiresAt.toISOString(),
      status: 'pending',
    })
    .eq('id', invitationId);

  if (updateError) {
    return { error: updateError.message };
  }

  // In a real implementation, you would send an email here
  // For now, we just update the invitation record

  if (invitation.property_id) {
    revalidatePath(`/properties/${invitation.property_id}`);
  }

  return { success: true };
}

export async function cancelInvitationAction(
  invitationId: string,
  propertyId: string
): Promise<ActionResult> {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required' };
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}
