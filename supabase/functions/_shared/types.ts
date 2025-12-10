/**
 * Shared types for Edge Functions
 */

export interface ApiCacheEntry {
  id?: string;
  property_id?: string;
  api_provider: 'epc' | 'hmlr' | 'flood' | 'crime' | 'planning' | 'postcodes';
  cache_key: string;
  payload: Record<string, unknown>;
  fetched_at?: string;
  expires_at: string;
  etag?: string;
  request_hash?: string;
  response_size_bytes?: number;
  error_message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Allow-Methods': string;
}

