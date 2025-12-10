/**
 * File: signed-url-cache.ts
 * Purpose: In-memory cache for signed URLs to reduce redundant API calls
 * Cache TTL: 1 hour (3600 seconds)
 */

interface CachedUrl {
  url: string;
  expiresAt: number;
}

const cache = new Map<string, CachedUrl>();
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

/**
 * Get cached signed URL if available and not expired
 * @param bucket - Storage bucket name
 * @param path - Storage path
 * @returns Cached URL or null if not found/expired
 */
export function getCachedSignedUrl(bucket: string, path: string): string | null {
  const key = `${bucket}:${path}`;
  const cached = cache.get(key);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  
  // Remove expired entry
  if (cached) {
    cache.delete(key);
  }
  
  return null;
}

/**
 * Store signed URL in cache
 * @param bucket - Storage bucket name
 * @param path - Storage path
 * @param url - Signed URL to cache
 */
export function setCachedSignedUrl(bucket: string, path: string, url: string): void {
  const key = `${bucket}:${path}`;
  cache.set(key, {
    url,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

/**
 * Clear cache for a specific bucket/path
 * @param bucket - Storage bucket name
 * @param path - Storage path
 */
export function clearCachedSignedUrl(bucket: string, path: string): void {
  const key = `${bucket}:${path}`;
  cache.delete(key);
}

/**
 * Clear all cached URLs (useful for testing or memory management)
 */
export function clearAllCachedUrls(): void {
  cache.clear();
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

