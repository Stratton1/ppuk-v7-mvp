/**
 * File: signed-url.ts
 * Purpose: Generate signed URLs for Supabase Storage objects with caching
 * Security: Server-side only, uses service role for access
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { getCachedSignedUrl, setCachedSignedUrl } from './signed-url-cache';

/**
 * Generate a signed URL for a storage object (with caching)
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
  // Check cache first
  const cached = getCachedSignedUrl(bucket, path);
  if (cached) {
    return cached;
  }

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

    // Cache the URL
    if (data?.signedUrl) {
      setCachedSignedUrl(bucket, path, data.signedUrl);
    }

    return data?.signedUrl ?? null;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }
}

/**
 * Batch generate signed URLs for multiple paths
 * Uses concurrency limit to avoid overwhelming the API
 * @param supabase - Supabase client instance
 * @param paths - Array of {bucket, path} objects
 * @param concurrencyLimit - Maximum concurrent requests (default: 10)
 * @returns Map of path -> signed URL
 */
export async function getBatchSignedUrls(
  supabase: ReturnType<typeof createClient<Database>>,
  paths: Array<{ bucket: string; path: string }>,
  concurrencyLimit: number = 10
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  // Process in batches to limit concurrency
  for (let i = 0; i < paths.length; i += concurrencyLimit) {
    const batch = paths.slice(i, i + concurrencyLimit);
    
    const batchResults = await Promise.allSettled(
      batch.map(async ({ bucket, path }) => {
        const key = `${bucket}:${path}`;
        const cached = getCachedSignedUrl(bucket, path);
        if (cached) {
          return { key, url: cached };
        }
        
        const url = await getSignedUrl(bucket, path);
        return { key, url };
      })
    );
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.key, result.value.url);
      } else {
        // On failure, set to null
        const index = batchResults.indexOf(result);
        if (index >= 0 && index < batch.length) {
          const key = `${batch[index].bucket}:${batch[index].path}`;
          results.set(key, null);
        }
      }
    });
  }
  
  return results;
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
