/**
 * Shared error handling utilities for Edge Functions
 */

import type { ApiResponse } from './types.ts';
import type { CorsHeaders } from './types.ts';

/**
 * Create CORS headers
 */
export function createCorsHeaders(origin?: string): CorsHeaders {
  const allowedOrigin = origin || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  origin?: string
): Response {
  const headers = createCorsHeaders(origin);
  return new Response(
    JSON.stringify({ success: false, error }),
    {
      status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  cached: boolean = false,
  origin?: string
): Response {
  const headers = createCorsHeaders(origin);
  const response: ApiResponse<T> = {
    success: true,
    data,
    cached,
  };
  
  return new Response(
    JSON.stringify(response),
    {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Handle CORS preflight request
 */
export function handleCors(origin?: string): Response | null {
  const headers = createCorsHeaders(origin);
  return new Response(null, {
    status: 204,
    headers,
  });
}

