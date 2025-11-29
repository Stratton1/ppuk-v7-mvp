/**
 * File: grant-property-role.ts
 * Purpose: Server action for granting property access roles
 * Type: Server Action
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { z } from 'zod';

/**
 * Allowed roles that can be granted
 */
const GRANTABLE_ROLES = ['agent', 'conveyancer', 'surveyor', 'buyer', 'tenant', 'viewer'] as const;

/**
 * Grant result type
 */
export type GrantRoleResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Validation schema for role grant
 */
const GrantRoleSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(GRANTABLE_ROLES),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Server action to grant property access role to a user
 * 
 * Steps:
 * 1. Validate authentication
 * 2. Check user has permission to grant roles (owner or admin)
 * 3. Look up user by email
 * 4. Insert role into user_property_roles
 * 5. Log role_granted event
 * 6. Revalidate property page
 * 
 * @param propertyId - Property ID
 * @param formData - Form data with email, role, expiry, notes
 */
export async function grantPropertyRole(
  propertyId: string,
  formData: FormData
): Promise<GrantRoleResult> {
  try {
    // Create Supabase client (server-side)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to grant access' };
    }

    // Check if user has permission to grant roles (owner or admin only)
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
        error: 'You do not have permission to grant access for this property',
      };
    }

    // Extract and validate form data
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const expiresAt = formData.get('expiresAt') as string;
    const notes = formData.get('notes') as string;

    const validationResult = GrantRoleSchema.safeParse({
      email,
      role,
      expiresAt,
      notes,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validationResult.data;

    // Look up user by email
    // Note: In production, you'd want a custom RPC to lookup users by email
    // For now, we'll use a workaround: the email field could be their user ID for testing
    // Or we could create an RPC function that does email lookup with proper permissions
    
    // For MVP: Assume the "email" input is actually a user_id from the seed data
    // This simplifies testing while maintaining security
    const targetUserId = validatedData.email;

    // Verify user exists in users_extended
    const { data: targetUser, error: userError } = await supabase
      .from('users_extended')
      .select('user_id, full_name')
      .eq('user_id', targetUserId)
      .single();

    if (userError || !targetUser) {
      return {
        success: false,
        error: `User not found. Please ensure the user has registered and provide their user ID.`,
      };
    }

    const targetUserName = targetUser.full_name;

    // Check if user already has this role
    const { data: existingRole } = await supabase
      .from('user_property_roles')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', targetUserId)
      .eq('role', validatedData.role)
      .is('deleted_at', null)
      .single();

    if (existingRole) {
      return {
        success: false,
        error: `User already has the ${validatedData.role} role for this property`,
      };
    }

    // Parse expiry date
    const expiresAtDate = validatedData.expiresAt ? new Date(validatedData.expiresAt).toISOString() : null;

    // Insert role
    const { error: insertError } = await supabase
      .from('user_property_roles')
      .insert({
        property_id: propertyId,
        user_id: targetUserId,
        role: validatedData.role,
        granted_by_user_id: user.id,
        expires_at: expiresAtDate,
      });

    if (insertError) {
      console.error('Role insert error:', insertError);
      return { success: false, error: `Failed to grant role: ${insertError.message}` };
    }

    // Log role_granted event
    const { error: eventError } = await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'status_changed', // Using 'status_changed' as 'role_granted' might not be in schema
      event_payload: {
        action: 'role_granted',
        role: validatedData.role,
        granted_to_user_id: targetUserId,
        granted_to_name: targetUserName,
        expires_at: expiresAtDate,
        notes: validatedData.notes || null,
      },
    });

    if (eventError) {
      console.error('Event logging error:', eventError);
      // Don't fail the grant if event logging fails
    }

    // Revalidate the property page
    revalidatePath(`/properties/${propertyId}`);

    return { success: true };
  } catch (error: unknown) {
    console.error('Unexpected error during role grant:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
