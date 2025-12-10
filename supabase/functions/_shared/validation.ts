/**
 * Shared validation utilities for Edge Functions
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

/**
 * EPC API request schema
 */
export const EpcRequestSchema = z.object({
  uprn: z.string().optional(),
  postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i).optional(),
  address: z.string().optional(),
}).refine(
  (data) => data.uprn || data.postcode || data.address,
  { message: 'At least one of uprn, postcode, or address must be provided' }
);

/**
 * HMLR API request schema
 */
export const HmlrRequestSchema = z.object({
  title_number: z.string().optional(),
  uprn: z.string().optional(),
  postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i).optional(),
}).refine(
  (data) => data.title_number || data.uprn || data.postcode,
  { message: 'At least one of title_number, uprn, or postcode must be provided' }
);

/**
 * Flood Risk API request schema
 */
export const FloodRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  uprn: z.string().optional(),
});

/**
 * Crime Data API request schema
 */
export const CrimeRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  date: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
});

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(
  provider: string,
  params: Record<string, unknown>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|');
  
  return `${provider}:${sortedParams}`;
}

