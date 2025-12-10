/**
 * Edge Function: HMLR (Land Registry) API
 * Purpose: Fetch title and price paid data from HM Land Registry API with caching
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCachedData, setCachedData } from '../_shared/cache.ts';
import { HmlrRequestSchema, generateCacheKey } from '../_shared/validation.ts';
import { createErrorResponse, createSuccessResponse, handleCors } from '../_shared/errors.ts';

// HM Land Registry API (example - actual endpoint may vary)
const HMLR_API_BASE_URL = 'https://use-land-property-data.service.gov.uk/api/v1';
const CACHE_TTL_HOURS = 24 * 30; // 1 month (title data changes infrequently)

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCors(req.headers.get('origin') || undefined);
  }

  const origin = req.headers.get('origin') || undefined;

  try {
    // Parse and validate request
    const body = await req.json().catch(() => ({}));
    const validationResult = HmlrRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        `Validation error: ${validationResult.error.issues[0].message}`,
        400,
        origin
      );
    }

    const params = validationResult.data;

    // Generate cache key
    const cacheKey = generateCacheKey('hmlr', params);

    // Check cache first
    const cached = await getCachedData('hmlr', cacheKey);
    if (cached && cached.payload) {
      return createSuccessResponse(cached.payload, true, origin);
    }

    // Fetch from HMLR API
    const hmlrApiKey = Deno.env.get('HMLR_API_KEY');
    if (!hmlrApiKey) {
      // If no API key, return mock data for development
      const mockData = {
        message: 'HMLR API key not configured. Using mock data.',
        title_number: params.title_number || null,
        tenure: 'freehold',
        price_history: [],
      };
      await setCachedData('hmlr', cacheKey, mockData, CACHE_TTL_HOURS);
      return createSuccessResponse(mockData, false, origin);
    }

    // Build API request
    let apiUrl: URL;
    if (params.title_number) {
      apiUrl = new URL(`${HMLR_API_BASE_URL}/titles/${params.title_number}`);
    } else if (params.uprn) {
      apiUrl = new URL(`${HMLR_API_BASE_URL}/titles`);
      apiUrl.searchParams.append('uprn', params.uprn);
    } else {
      apiUrl = new URL(`${HMLR_API_BASE_URL}/titles`);
      apiUrl.searchParams.append('postcode', params.postcode!);
    }

    try {
      const apiResponse = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${hmlrApiKey}`,
        },
      });

      if (!apiResponse.ok) {
        throw new Error(`HMLR API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      // Transform to consistent format
      const transformedData = {
        title_number: params.title_number || data.title_number,
        tenure: data.tenure || 'unknown',
        price_history: data.price_history || [],
        last_updated: new Date().toISOString(),
        raw_data: data,
      };

      // Cache successful response
      await setCachedData('hmlr', cacheKey, transformedData, CACHE_TTL_HOURS);

      return createSuccessResponse(transformedData, false, origin);
    } catch (apiError) {
      // If API fails, return mock data
      const mockData = {
        title_number: params.title_number || null,
        tenure: 'freehold',
        price_history: [],
        message: 'HMLR API error. Using mock data.',
        last_updated: new Date().toISOString(),
      };

      await setCachedData('hmlr', cacheKey, mockData, CACHE_TTL_HOURS);
      return createSuccessResponse(mockData, false, origin);
    }
  } catch (error) {
    console.error('HMLR Edge Function error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      origin
    );
  }
});

