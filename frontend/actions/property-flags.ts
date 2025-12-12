/**
 * File: property-flags.ts
 * Purpose: Server actions for property flags management
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { z } from 'zod';
import type { Database } from '@/types/supabase';

/**
 * Flag creation schema
 */
const CreateFlagSchema = z.object({
  propertyId: z.string().uuid(),
  flagType: z.enum(['data_quality', 'risk', 'compliance', 'ownership', 'document', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
});

/**
 * Flag update schema
 */
const UpdateFlagSchema = z.object({
  flagId: z.string().uuid(),
  status: z.enum(['open', 'in_review', 'resolved', 'dismissed']).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateFlagResult =
  | { success: true; flagId: string }
  | { success: false; error: string };

export type UpdateFlagResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Create a property flag
 */
export async function createPropertyFlag(
  formData: FormData
): Promise<CreateFlagResult> {
  try {
    const user = await getServerUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createActionClient();
    const userId = user.id;

    // Parse and validate form data
    const rawData = {
      propertyId: formData.get('propertyId') as string,
      flagType: formData.get('flagType') as string,
      severity: formData.get('severity') as string,
      description: formData.get('description') as string,
    };

    const validationResult = CreateFlagSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const { propertyId, flagType, severity, description } = validationResult.data;

    // Check user can view property (required to create flag)
    const canViewArgs: Database['public']['Functions']['can_view_property']['Args'] = {
      property_id: propertyId,
    };
    const { data: canView, error: viewError } = await supabase.rpc(
      'can_view_property',
      canViewArgs
    );

    if (viewError || !canView) {
      return {
        success: false,
        error: 'You do not have permission to create flags for this property',
      };
    }

    // Insert flag
    // Note: property_flags table may not exist yet in schema - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flag, error: insertError } = await (supabase as any)
      .from('property_flags')
      .insert({
        property_id: propertyId,
        created_by_user_id: userId,
        flag_type: flagType,
        severity,
        description,
        status: 'open',
      })
      .select('id')
      .single();

    if (insertError || !flag) {
      console.error('Flag creation error:', insertError);
      return {
        success: false,
        error: insertError?.message || 'Failed to create flag',
      };
    }

    // Log event
    await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: userId,
      event_type: 'flag_added',
      event_payload: {
        flag_id: flag.id,
        flag_type: flagType,
        severity,
      },
    });

    revalidatePath(`/properties/${propertyId}`);
    return { success: true, flagId: flag.id };
  } catch (error) {
    console.error('Create flag error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a property flag (status, description)
 */
export async function updatePropertyFlag(
  formData: FormData
): Promise<UpdateFlagResult> {
  try {
    const user = await getServerUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createActionClient();
    const userId = user.id;

    // Parse and validate form data
    const rawData = {
      flagId: formData.get('flagId') as string,
      status: formData.get('status') as string | undefined,
      description: formData.get('description') as string | undefined,
    };

    const validationResult = UpdateFlagSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const { flagId, status, description } = validationResult.data;

    // Get existing flag to check permissions
    // Note: property_flags table may not exist yet in schema - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingFlag, error: fetchError } = await (supabase as any)
      .from('property_flags')
      .select('property_id, created_by_user_id, status')
      .eq('id', flagId)
      .is('deleted_at', null)
      .single() as { data: { property_id: string; created_by_user_id: string; status: string } | null; error: Error | null };

    if (fetchError || !existingFlag) {
      return { success: false, error: 'Flag not found' };
    }

    // Check permissions: can edit property OR created the flag
    const canEditArgs: Database['public']['Functions']['can_edit_property']['Args'] = {
      property_id: existingFlag.property_id,
    };
    const { data: canEdit } = await supabase.rpc('can_edit_property', canEditArgs);

    const isCreator = existingFlag.created_by_user_id === userId;

    if (!canEdit && !isCreator) {
      return {
        success: false,
        error: 'You do not have permission to update this flag',
      };
    }

    // If resolving/dismissing, only editors can do this
    if (status && ['resolved', 'dismissed'].includes(status) && !canEdit) {
      return {
        success: false,
        error: 'Only editors can resolve or dismiss flags',
      };
    }

    // Build update object
    const updateData: {
      status?: string;
      description?: string;
      resolved_at?: string | null;
      resolved_by_user_id?: string | null;
    } = {};

    if (status !== undefined) {
      updateData.status = status;
      if (['resolved', 'dismissed'].includes(status)) {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by_user_id = userId;
      } else if (status === 'open') {
        updateData.resolved_at = null;
        updateData.resolved_by_user_id = null;
      }
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    // Update flag
    // Note: property_flags table may not exist yet in schema - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('property_flags')
      .update(updateData)
      .eq('id', flagId);

    if (updateError) {
      console.error('Flag update error:', updateError);
      return {
        success: false,
        error: updateError.message || 'Failed to update flag',
      };
    }

    // Log event if status changed
    if (status && status !== existingFlag.status) {
      await supabase.from('property_events').insert({
        property_id: existingFlag.property_id,
        actor_user_id: userId,
        event_type: status === 'resolved' ? 'flag_resolved' : 'flag_added',
        event_payload: {
          flag_id: flagId,
          old_status: existingFlag.status,
          new_status: status,
        },
      });
    }

    revalidatePath(`/properties/${existingFlag.property_id}`);
    return { success: true };
  } catch (error) {
    console.error('Update flag error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a property flag (soft delete)
 */
export async function deletePropertyFlag(flagId: string): Promise<UpdateFlagResult> {
  try {
    const user = await getServerUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createActionClient();

    // Get existing flag
    // Note: property_flags table may not exist yet in schema - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingFlag, error: fetchError } = await (supabase as any)
      .from('property_flags')
      .select('property_id, created_by_user_id')
      .eq('id', flagId)
      .is('deleted_at', null)
      .single() as { data: { property_id: string; created_by_user_id: string } | null; error: Error | null };

    if (fetchError || !existingFlag) {
      return { success: false, error: 'Flag not found' };
    }

    // Check permissions: can edit property OR created the flag
    const canEditArgs: Database['public']['Functions']['can_edit_property']['Args'] = {
      property_id: existingFlag.property_id,
    };
    const { data: canEdit } = await supabase.rpc('can_edit_property', canEditArgs);

    const isCreator = existingFlag.created_by_user_id === user.id;

    if (!canEdit && !isCreator) {
      return {
        success: false,
        error: 'You do not have permission to delete this flag',
      };
    }

    // Soft delete
    // Note: property_flags table may not exist yet in schema - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('property_flags')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', flagId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || 'Failed to delete flag',
      };
    }

    revalidatePath(`/properties/${existingFlag.property_id}`);
    return { success: true };
  } catch (error) {
    console.error('Delete flag error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

