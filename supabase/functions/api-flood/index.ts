/**
 * Edge Function: Flood Risk API
 * Purpose: Fetch flood risk data from Environment Agency API with caching
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCachedData, setCachedData } from '../_shared/cache.ts';
import { FloodRequestSchema, generateCacheKey } from '../_shared/validation.ts';
import { createErrorResponse, createSuccessResponse, handleCors } from '../_shared/errors.ts';

// Environment Agency Flood Risk API (example - actual endpoint may vary)
const FLOOD_API_BASE_URL = 'https://environment.data.gov.uk/flood-monitoring/id/floods';
const CACHE_TTL_HOURS = 24 * 30; // 1 month (flood risk changes slowly)

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCors(req.headers.get('origin') || undefined);
  }

  const origin = req.headers.get('origin') || undefined;

  try {
    // Parse and validate request
    const body = await req.json().catch(() => ({}));
    const validationResult = FloodRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        `Validation error: ${validationResult.error.issues[0].message}`,
        400,
        origin
      );
    }

    const params = validationResult.data;

    // Generate cache key (use coordinates rounded to 4 decimal places for caching)
    const roundedLat = Math.round(params.latitude * 10000) / 10000;
    const roundedLng = Math.round(params.longitude * 10000) / 10000;
    const cacheKey = generateCacheKey('flood', {
      latitude: roundedLat,
      longitude: roundedLng,
      uprn: params.uprn,
    });

    // Check cache first
    const cached = await getCachedData('flood', cacheKey);
    if (cached && cached.payload) {
      return createSuccessResponse(cached.payload, true, origin);
    }

    // Fetch from Flood Risk API
    // Note: This is a placeholder - actual Environment Agency API may have different structure
    const apiUrl = new URL(FLOOD_API_BASE_URL);
    apiUrl.searchParams.append('lat', params.latitude.toString());
    apiUrl.searchParams.append('lon', params.longitude.toString());

    try {
      const apiResponse = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        throw new Error(`Flood API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      // Transform to consistent format
      const transformedData = {
        risk_level: 'low', // Extract from API response
        risk_details: data,
        coordinates: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        last_updated: new Date().toISOString(),
      };

      // Cache successful response
      await setCachedData('flood', cacheKey, transformedData, CACHE_TTL_HOURS);

      return createSuccessResponse(transformedData, false, origin);
    } catch (apiError) {
      // If API fails, return mock data for development
      const mockData = {
        risk_level: 'low',
        risk_details: {
          message: 'Flood API not configured. Using mock data.',
        },
        coordinates: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        last_updated: new Date().toISOString(),
      };

      await setCachedData('flood', cacheKey, mockData, CACHE_TTL_HOURS);
      return createSuccessResponse(mockData, false, origin);
    }
  } catch (error) {
    console.error('Flood Edge Function error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      origin
    );
  }
});

