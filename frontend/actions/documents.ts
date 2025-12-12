'use server';

import { Buffer } from 'buffer';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerUser } from '@/lib/auth/server-user';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/forms';
import type { Database } from '@/types/supabase';

const documentCategories = [
  'ownership',
  'legal',
  'safety',
  'environmental',
  'surveys',
  'guarantees',
  'works',
  'planning',
  'insurance',
  'miscellaneous',
] as const;

const mimeWhitelist = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const CreateDocumentSchema = z.object({
  propertyId: z.string().uuid(),
  category: z.enum(documentCategories),
  name: z.string().min(1),
});

export async function createDocumentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const parsed = CreateDocumentSchema.safeParse({
      propertyId: formData.get('propertyId'),
      category: formData.get('category'),
      name: formData.get('name'),
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    }

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'File is required' };
    if (file.size === 0) return { success: false, error: 'Empty file' };
    if (!mimeWhitelist.includes(file.type)) return { success: false, error: 'File type not allowed' };

    const supabase = await createClient();
    const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: parsed.data.propertyId });
    if (!canEdit && !user.isAdmin) {
      return { success: false, error: 'No permission to upload documents' };
    }

    const storagePath = `${parsed.data.propertyId}/${crypto.randomUUID()}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      // property-documents bucket expected
      .from('property-documents')
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) {
      console.error('Document upload error', uploadError);
      return { success: false, error: 'Upload failed' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('documents')
      .insert({
        property_id: parsed.data.propertyId,
        uploaded_by_user_id: user.id,
        title: parsed.data.name,
        document_type: parsed.data.category,
        storage_bucket: 'property-documents',
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        status: 'active',
      });

    if (insertError) {
      console.error('Document insert error', insertError);
      await supabase.storage.from('property-documents').remove([storagePath]);
      return { success: false, error: 'Failed to save document' };
    }

    revalidatePath(`/properties/${parsed.data.propertyId}`);
    return { success: true };
  } catch (error) {
    console.error('createDocumentAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function deleteDocumentAction(documentId: string, propertyId: string): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc, error } = await (supabase as any)
      .from('documents')
      .select('id, property_id, storage_path, storage_bucket, uploaded_by_user_id')
      .eq('id', documentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !doc) return { success: false, error: 'Document not found' };

    const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: doc.property_id });
    if (!canEdit && doc.uploaded_by_user_id !== user.id && !user.isAdmin) {
      return { success: false, error: 'No permission to delete' };
    }

    const path = doc.storage_path;
    const bucket = doc.storage_bucket || 'property-documents';

    // Soft delete record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('documents')
      .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
      .eq('id', documentId);
    if (deleteError) return { success: false, error: 'Failed to delete document' };

    if (path) {
      await supabase.storage.from(bucket).remove([path]);
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
  } catch (error) {
    console.error('deleteDocumentAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function updateDocumentCategoryAction(documentId: string, category: string): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    if (!documentCategories.includes(category as typeof documentCategories[number])) {
      return { success: false, error: 'Invalid category' };
    }
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc, error } = await (supabase as any)
      .from('documents')
      .select('property_id')
      .eq('id', documentId)
      .maybeSingle();
    if (error || !doc) return { success: false, error: 'Document not found' };

    const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: doc.property_id });
    if (!canEdit && !user.isAdmin) return { success: false, error: 'No permission to edit' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('documents')
      .update({ document_type: category })
      .eq('id', documentId);

    if (updateError) return { success: false, error: 'Failed to update category' };
    revalidatePath(`/properties/${doc.property_id}`);
    return { success: true };
  } catch (error) {
    console.error('updateDocumentCategoryAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}
