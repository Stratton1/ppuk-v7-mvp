import { getServerUser } from '@/lib/auth/server-user';
import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';

export async function canUploadDocuments(propertyId: string): Promise<boolean> {
  const user = await getServerUser();
  if (!user) return false;
  if (user.isAdmin) return true;

  const supabase = await createClient();
  const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: propertyId });
  return Boolean(canEdit);
}

export async function canEditDocuments(propertyId: string): Promise<boolean> {
  return canUploadDocuments(propertyId);
}

export async function canUploadMedia(propertyId: string): Promise<boolean> {
  return canUploadDocuments(propertyId);
}
