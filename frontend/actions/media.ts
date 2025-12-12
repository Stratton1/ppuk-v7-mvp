'use server';

import { Buffer } from 'buffer';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createActionClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import type { ActionResult } from '@/types/forms';

const mediaCategories = ['photos', 'floorplans', 'tours', 'brochures', 'drone', 'videos', 'misc'] as const;
const mediaMimeWhitelist = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4', 'video/quicktime'];

const UploadMediaSchema = z.object({
  propertyId: z.string().uuid(),
  category: z.enum(mediaCategories),
});

export async function uploadMediaAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const parsed = UploadMediaSchema.safeParse({
      propertyId: formData.get('propertyId'),
      category: formData.get('category'),
    });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'File is required' };
    if (!mediaMimeWhitelist.includes(file.type)) return { success: false, error: 'Unsupported media type' };

    const supabase = await createActionClient();
    const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: parsed.data.propertyId });
    if (!canEdit && !user.isAdmin) return { success: false, error: 'No permission to upload media' };

    const storagePath = `${parsed.data.propertyId}/${crypto.randomUUID()}/${file.name}`;
    const bucket = 'property-photos';
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) {
      console.error('uploadMediaAction storage error', uploadError);
      return { success: false, error: 'Upload failed' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('media')
      .insert({
        property_id: parsed.data.propertyId,
        uploaded_by_user_id: user.id,
        storage_bucket: bucket,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        media_type: parsed.data.category === 'videos' ? 'video' : parsed.data.category === 'floorplans' ? 'floorplan' : 'photo',
        status: 'active',
      });
    if (insertError) {
      console.error('uploadMediaAction insert error', insertError);
      await supabase.storage.from(bucket).remove([storagePath]);
      return { success: false, error: 'Failed to save media' };
    }

    revalidatePath(`/properties/${parsed.data.propertyId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('uploadMediaAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function deleteMediaAction(mediaId: string, propertyId: string): Promise<ActionResult> {
  try {
    const user = await getServerUser();
    if (!user) return { success: false, error: 'Not authenticated' };
    const supabase = await createActionClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mediaRow, error } = await (supabase as any)
      .from('media')
      .select('storage_path, storage_bucket, property_id, uploaded_by_user_id')
      .eq('id', mediaId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error || !mediaRow) return { success: false, error: 'Media not found' };

    const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: mediaRow.property_id });
    if (!canEdit && mediaRow.uploaded_by_user_id !== user.id && !user.isAdmin) {
      return { success: false, error: 'No permission to delete media' };
    }

    const bucket = mediaRow.storage_bucket || 'property-photos';
    if (mediaRow.storage_path) {
      await supabase.storage.from(bucket).remove([mediaRow.storage_path]);
    }

    // Soft delete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('media')
      .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
      .eq('id', mediaId);
    if (deleteError) return { success: false, error: 'Failed to delete media' };

    revalidatePath(`/properties/${propertyId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('deleteMediaAction error', error);
    return { success: false, error: 'Unexpected error' };
  }
}
