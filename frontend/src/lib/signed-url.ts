/**
 * File: signed-url.ts
 * Purpose: Generate signed URLs for Supabase Storage objects
 * Security: Server-side only, uses service role for access
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Generate a signed URL for a storage object
 * @param bucket - Storage bucket name (e.g., 'property-photos', 'property-documents')
 * @param path - Path to the object within the bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL or null if generation fails
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    // Create Supabase client (server-side only)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error.message);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }
}

/**
 * Get signed URL for featured property media
 * Uses property-photos bucket
 */
export async function getFeaturedMediaUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  return getSignedUrl('property-photos', storagePath, expiresIn);
}

/**
 * Get signed URL for property document
 * Uses property-documents bucket
 */
export async function getDocumentUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  return getSignedUrl('property-documents', storagePath, expiresIn);
}

/**
 * Placeholder image URL for fallback
 */
export const PLACEHOLDER_IMAGE = '/placeholder.svg';
