/**
 * Edge Function: EPC Register API
 * Purpose: Fetch EPC data from UK EPC Register API with caching
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCachedData, setCachedData } from '../_shared/cache.ts';
import { EpcRequestSchema, generateCacheKey } from '../_shared/validation.ts';
import { createErrorResponse, createSuccessResponse, handleCors } from '../_shared/errors.ts';

const EPC_API_BASE_URL = 'https://epc.opendatacommunities.org/api/v1/domestic/search';
const CACHE_TTL_HOURS = 24 * 7; // 1 week (EPC data changes infrequently)

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCors(req.headers.get('origin') || undefined);
  }

  const origin = req.headers.get('origin') || undefined;

  try {
    // Parse and validate request
    const body = await req.json().catch(() => ({}));
    const validationResult = EpcRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        `Validation error: ${validationResult.error.issues[0].message}`,
        400,
        origin
      );
    }

    const params = validationResult.data;

    // Generate cache key
    const cacheKey = generateCacheKey('epc', params);

    // Check cache first
    const cached = await getCachedData('epc', cacheKey);
    if (cached && cached.payload) {
      return createSuccessResponse(cached.payload, true, origin);
    }

    // Fetch from EPC API
    const epcApiKey = Deno.env.get('EPC_API_KEY');
    if (!epcApiKey) {
      // If no API key, return mock data for development
      const mockData = {
        message: 'EPC API key not configured. Using mock data.',
        data: [],
      };
      await setCachedData('epc', cacheKey, mockData, CACHE_TTL_HOURS);
      return createSuccessResponse(mockData, false, origin);
    }

    // Build API request
    const apiUrl = new URL(EPC_API_BASE_URL);
    if (params.uprn) apiUrl.searchParams.append('uprn', params.uprn);
    if (params.postcode) apiUrl.searchParams.append('postcode', params.postcode);
    if (params.address) apiUrl.searchParams.append('address', params.address);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(epcApiKey + ':')}`,
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      const errorMessage = `EPC API error: ${apiResponse.status} ${apiResponse.statusText}`;
      
      // Cache error to avoid immediate retries
      await setCachedData('epc', cacheKey, {}, 1, undefined, errorMessage);
      
      return createErrorResponse(errorMessage, apiResponse.status, origin);
    }

    const data = await apiResponse.json();

    // Cache successful response
    await setCachedData('epc', cacheKey, data, CACHE_TTL_HOURS);

    return createSuccessResponse(data, false, origin);
  } catch (error) {
    console.error('EPC Edge Function error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      origin
    );
  }
});

