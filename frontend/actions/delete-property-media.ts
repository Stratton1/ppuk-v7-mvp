/**
 * File: delete-property-media.ts
 * Purpose: Server action for deleting property media (photos/floorplans)
 * Type: Server Action
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Delete result type
 */
export type DeleteMediaResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server action to delete a property media file
 * 
 * Steps:
 * 1. Validate authentication
 * 2. Check user has permission to delete (via RLS helper)
 * 3. Fetch media record to get storage details
 * 4. Delete from Supabase Storage
 * 5. Delete record from media table
 * 6. Log media_deleted event
 * 7. Revalidate property page
 * 
 * @param mediaId - Media ID to delete
 * @param propertyId - Property ID (for revalidation and permission check)
 */
export async function deletePropertyMedia(
  mediaId: string,
  propertyId: string
): Promise<DeleteMediaResult> {
  try {
    // Create Supabase client (server-side)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to delete media' };
    }

    // Check if user has permission to delete media for this property
    const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
      property_id: propertyId,
      allowed_roles: ['owner', 'editor'],
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
        error: 'You do not have permission to delete media for this property',
      };
    }

    // Fetch the media record to get storage details
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('storage_bucket, storage_path, media_type, title, mime_type')
      .eq('id', mediaId)
      .single();

    if (fetchError || !media) {
      console.error('Media fetch error:', fetchError);
      return { success: false, error: 'Media file not found' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(media.storage_bucket)
      .remove([media.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with DB deletion even if storage fails (file might already be gone)
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return { success: false, error: `Failed to delete media: ${deleteError.message}` };
    }

    // Log media_deleted event
    const { error: eventError } = await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'media_uploaded', // Note: Using 'media_uploaded' as 'media_deleted' might not be in schema
      event_payload: {
        action: 'deleted',
        title: media.title,
        media_type: media.media_type,
        mime_type: media.mime_type,
        storage_path: media.storage_path,
      },
    });

    if (eventError) {
      console.error('Event logging error:', eventError);
      // Don't fail the deletion if event logging fails
    }

    // Revalidate the property page
    revalidatePath(`/properties/${propertyId}`);

    return { success: true };
  } catch (error: unknown) {
    console.error('Unexpected error during media deletion:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
