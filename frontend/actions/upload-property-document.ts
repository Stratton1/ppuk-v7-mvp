/**
 * File: upload-property-document.ts
 * Purpose: Server action for uploading property documents
 * Type: Server Action
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { z } from 'zod';

/**
 * Allowed document types (must match database constraint)
 */
const ALLOWED_DOCUMENT_TYPES = [
  'title',
  'survey',
  'search',
  'identity',
  'contract',
  'warranty',
  'planning',
  'compliance',
  'other',
] as const;

/**
 * Allowed MIME types
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff',
];

/**
 * Maximum file size (20MB)
 */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Upload result type
 */
export type UploadDocumentResult =
  | { success: true; documentId: string }
  | { success: false; error: string };

/**
 * Validation schema for document upload
 */
const UploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  documentType: z.enum(ALLOWED_DOCUMENT_TYPES),
  notes: z.string().optional(),
  version: z.coerce.number().min(1).default(1),
});

/**
 * Server action to upload a property document
 * 
 * Steps:
 * 1. Validate authentication
 * 2. Validate form data
 * 3. Check user has permission to upload (via RLS helper)
 * 4. Upload file to Supabase Storage
 * 5. Insert record into documents table
 * 6. Log document_uploaded event
 * 7. Revalidate property page
 * 
 * @param propertyId - Property ID
 * @param formData - Form data with file
 */
export async function uploadPropertyDocument(
  propertyId: string,
  formData: FormData
): Promise<UploadDocumentResult> {
  try {
    // Create Supabase client (server-side)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to upload documents' };
    }

    // Extract form data
    const title = formData.get('title') as string;
    const documentType = formData.get('documentType') as string;
    const notes = formData.get('notes') as string;
    const version = formData.get('version') as string;
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file || file.size === 0) {
      return { success: false, error: 'No file selected' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `File size must not exceed 20MB (current: ${Math.round(file.size / 1024 / 1024)}MB)` };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: `File type not allowed: ${file.type}` };
    }

    // Validate form data with Zod
    const validationResult = UploadDocumentSchema.safeParse({
      title,
      documentType,
      notes,
      version,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const validatedData = validationResult.data;

    // Check if user has permission to upload documents for this property
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
        error: 'You do not have permission to upload documents for this property',
      };
    }

    // Generate unique file path
    const uniqueId = crypto.randomUUID();
    const storagePath = `${propertyId}/${uniqueId}/${file.name}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('property-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Insert document record into database
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        property_id: propertyId,
        uploaded_by_user_id: user.id,
        title: validatedData.title,
        document_type: validatedData.documentType,
        storage_bucket: 'property-documents',
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        version: validatedData.version,
        status: 'active',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      
      // Clean up uploaded file
      await supabase.storage.from('property-documents').remove([storagePath]);
      
      return { success: false, error: `Failed to save document: ${insertError.message}` };
    }

    // Log document_uploaded event
    const { error: eventError } = await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'document_uploaded',
      event_payload: {
        title: validatedData.title,
        document_type: validatedData.documentType,
        version: validatedData.version,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      },
    });

    if (eventError) {
      console.error('Event logging error:', eventError);
      // Don't fail the upload if event logging fails
    }

    // Revalidate the property page to show the new document
    revalidatePath(`/properties/${propertyId}`);

    return { success: true, documentId: document.id };
  } catch (error: unknown) {
    console.error('Unexpected error during document upload:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
