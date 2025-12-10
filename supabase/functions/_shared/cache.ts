/**
 * Shared cache utilities for Edge Functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import type { ApiCacheEntry } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/**
 * Get cached API data if available and not expired
 */
export async function getCachedData(
  provider: ApiCacheEntry['api_provider'],
  cacheKey: string
): Promise<ApiCacheEntry | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from('api_cache')
    .select('*')
    .eq('api_provider', provider)
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .is('error_message', null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ApiCacheEntry;
}

/**
 * Store API response in cache
 */
export async function setCachedData(
  provider: ApiCacheEntry['api_provider'],
  cacheKey: string,
  payload: Record<string, unknown>,
  ttlHours: number,
  propertyId?: string,
  errorMessage?: string
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  const cacheEntry: Partial<ApiCacheEntry> = {
    api_provider: provider,
    cache_key: cacheKey,
    payload,
    expires_at: expiresAt.toISOString(),
    error_message: errorMessage,
  };

  if (propertyId) {
    cacheEntry.property_id = propertyId;
  }

  const responseSize = JSON.stringify(payload).length;

  await supabase.from('api_cache').upsert({
    ...cacheEntry,
    response_size_bytes: responseSize,
    fetched_at: new Date().toISOString(),
  }, {
    onConflict: 'api_provider,cache_key',
  });
}

