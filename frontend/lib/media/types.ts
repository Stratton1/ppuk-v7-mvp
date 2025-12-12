import { getSignedUrl } from '@/lib/signed-url';
import type { Database } from '@/types/supabase';

export type MediaCategoryId = 'photos' | 'floorplans' | 'tours' | 'brochures' | 'drone' | 'videos' | 'misc';

export interface UidMedia {
  id: string;
  propertyId: string;
  category: MediaCategoryId;
  url: string | null;
  uploadedAt: string;
  uploadedBy: string | null;
  size?: number | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
}

type MediaRow = Database['public']['Tables']['media']['Row'];

export function mapMediaTypeToCategory(mediaType?: string | null): MediaCategoryId {
  const type = (mediaType || '').toLowerCase();
  if (type === 'photo' || type === 'image') return 'photos';
  if (type === 'floorplan') return 'floorplans';
  if (type === 'video') return 'videos';
  if (type === 'brochure') return 'brochures';
  if (type === 'drone') return 'drone';
  if (type === 'tour') return 'tours';
  return 'misc';
}

export async function mediaRowToUidMedia(row: MediaRow): Promise<UidMedia> {
  const bucket = row.storage_bucket || 'property-photos';
  const signedUrl = row.storage_path ? await getSignedUrl(bucket, row.storage_path) : null;

  return {
    id: row.id,
    propertyId: row.property_id,
    category: mapMediaTypeToCategory(row.media_type),
    url: signedUrl,
    uploadedAt: row.created_at,
    uploadedBy: row.uploaded_by_user_id ?? null,
    size: row.size_bytes ?? null,
    mimeType: row.mime_type ?? null,
    width: (row as unknown as { width?: number })?.width ?? null,
    height: (row as unknown as { height?: number })?.height ?? null,
  };
}
