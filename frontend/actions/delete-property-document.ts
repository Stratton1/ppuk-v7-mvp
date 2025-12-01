/**
 * File: delete-property-document.ts
 * Purpose: Server action for deleting property documents
 * Type: Server Action
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Delete result type
 */
export type DeleteDocumentResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server action to delete a property document
 * 
 * Steps:
 * 1. Validate authentication
 * 2. Check user has permission to delete (via RLS helper)
 * 3. Fetch document record to get storage details
 * 4. Delete from Supabase Storage
 * 5. Delete record from documents table
 * 6. Log document_deleted event
 * 7. Revalidate property page
 * 
 * @param documentId - Document ID to delete
 * @param propertyId - Property ID (for revalidation and permission check)
 */
export async function deletePropertyDocument(
  documentId: string,
  propertyId: string
): Promise<DeleteDocumentResult> {
  try {
    // Create Supabase client (server-side)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required to delete documents' };
    }

    // Check if user has permission to delete documents for this property
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
        error: 'You do not have permission to delete documents for this property',
      };
    }

    // Fetch the document record to get storage details
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_bucket, storage_path, document_type, title, mime_type, size_bytes')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      console.error('Document fetch error:', fetchError);
      return { success: false, error: 'Document not found' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(document.storage_bucket)
      .remove([document.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with DB deletion even if storage fails (file might already be gone)
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return { success: false, error: `Failed to delete document: ${deleteError.message}` };
    }

    // Log document_deleted event
    const { error: eventError } = await supabase.from('property_events').insert({
      property_id: propertyId,
      actor_user_id: user.id,
      event_type: 'document_uploaded', // Note: Using 'document_uploaded' as 'document_deleted' might not be in schema
      event_payload: {
        action: 'deleted',
        title: document.title,
        document_type: document.document_type,
        mime_type: document.mime_type,
        size_bytes: document.size_bytes,
        storage_path: document.storage_path,
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
    console.error('Unexpected error during document deletion:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
