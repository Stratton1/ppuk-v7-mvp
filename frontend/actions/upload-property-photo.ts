/**
 * File: upload-property-photo.ts
 * Purpose: Server action for uploading property photos
 * Type: Server Action
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { z } from 'zod';

/**
 * Allowed media types
 */
const ALLOWED_MEDIA_TYPES = ['photo', 'floorplan', 'other'] as const;

/**
 * Allowed MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'application/pdf', // For floorplans
];

/**
 * Maximum file size (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload result type
 */
export type UploadPhotoResult =
  | { success: true; mediaId: string }
  | { success: false; error: string };

/**
 * Validation schema for photo upload
 */
const UploadPhotoSchema = z.object({
  mediaType: z.enum(ALLOWED_MEDIA_TYPES),
  description: z.string().optional(),
});

/**
 * Server action to upload a property photo
 * 
 * Steps:
 * 1. Validate authentication
 * 2. Validate form data
 * 3. Check user has permission to upload (via RLS helper)
 * 4. Upload file to Supabase Storage
 * 5. Insert record into media table
 * 6. Log media_uploaded event
 * 7. Revalidate property page
 * 
 * @param propertyId - Property ID
 * @param formData - Form data with file
 */
export async function uploadPropertyPhoto(
  propertyId: string,
  formData: FormData
): Promise<UploadPhotoResult> {
  try {
    // Create Supabase client (server-side)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to upload photos' };
    }

    // Extract form data
    const mediaType = formData.get('mediaType') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file || file.size === 0) {
      return { success: false, error: 'No file selected' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size must not exceed 10MB (current: ${Math.round(file.size / 1024 / 1024)}MB)`,
      };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: `File type not allowed: ${file.type}` };
    }

    // Validate form data with Zod
    const validationResult = UploadPhotoSchema.safeParse({
      mediaType,
      description,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validationResult.data;

    // Check if user has permission to upload photos for this property
    const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
      property_id: propertyId,
      allowed_roles: ['owner', 'editor'],
    };
    const { data: hasPermission, error: permissionError } = await supabase.rpc('has_property_role', hasPropertyRoleArgs);

    if (permissionError) {
      console.error('Permission check error:', permissionError);
      return { success: false, error: 'Failed to verify permissions' };
    }

    if (!hasPermission) {
      return {
        success: false,
        error: 'You do not have permission to upload photos for this property',
      };
    }

    // Generate unique file path
    const uniqueId = crypto.randomUUID();
    const storagePath = `${propertyId}/${uniqueId}/${file.name}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Insert media record into database
    // Use description as title if provided, otherwise use filename
    const title = validatedData.description || file.name;
    
    const { data: media, error: insertError } = await supabase
      .from('media')
      .insert({
        property_id: propertyId,
        uploaded_by_user_id: user.id,
        media_type: validatedData.mediaType,
        title: title,
        storage_bucket: 'property-photos',
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        status: 'active',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);

      // Clean up uploaded file
      await supabase.storage.from('property-photos').remove([storagePath]);

      return { success: false, error: `Failed to save photo: ${insertError.message}` };
    }

    // Log media_uploaded event
    const { error: eventError } = await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'media_uploaded',
      event_payload: {
        file_name: file.name,
        mime_type: file.type,
        media_type: validatedData.mediaType,
        size_bytes: file.size,
        description: validatedData.description || null,
      },
    });

    if (eventError) {
      console.error('Event logging error:', eventError);
      // Don't fail the upload if event logging fails
    }

    // Revalidate the property page to show the new photo
    revalidatePath(`/properties/${propertyId}`);

    return { success: true, mediaId: media.id };
  } catch (error: unknown) {
    console.error('Unexpected error during photo upload:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
