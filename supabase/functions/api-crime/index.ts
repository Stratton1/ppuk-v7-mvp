/**
 * Edge Function: Crime Data API
 * Purpose: Fetch crime statistics from Police.uk API with caching
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCachedData, setCachedData } from '../_shared/cache.ts';
import { CrimeRequestSchema, generateCacheKey } from '../_shared/validation.ts';
import { createErrorResponse, createSuccessResponse, handleCors } from '../_shared/errors.ts';

// Police.uk API (no auth required)
const CRIME_API_BASE_URL = 'https://data.police.uk/api/crimes-street/all-crime';
const CACHE_TTL_HOURS = 24 * 7; // 1 week (crime data updates monthly)

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCors(req.headers.get('origin') || undefined);
  }

  const origin = req.headers.get('origin') || undefined;

  try {
    // Parse and validate request
    const body = await req.json().catch(() => ({}));
    const validationResult = CrimeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        `Validation error: ${validationResult.error.issues[0].message}`,
        400,
        origin
      );
    }

    const params = validationResult.data;

    // Generate cache key
    const date = params.date || new Date().toISOString().slice(0, 7); // YYYY-MM
    const roundedLat = Math.round(params.latitude * 10000) / 10000;
    const roundedLng = Math.round(params.longitude * 10000) / 10000;
    const cacheKey = generateCacheKey('crime', {
      latitude: roundedLat,
      longitude: roundedLng,
      date,
    });

    // Check cache first
    const cached = await getCachedData('crime', cacheKey);
    if (cached && cached.payload) {
      return createSuccessResponse(cached.payload, true, origin);
    }

    // Fetch from Police.uk API
    const apiUrl = new URL(CRIME_API_BASE_URL);
    apiUrl.searchParams.append('lat', params.latitude.toString());
    apiUrl.searchParams.append('lng', params.longitude.toString());
    if (params.date) {
      apiUrl.searchParams.append('date', params.date);
    }

    try {
      const apiResponse = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!apiResponse.ok) {
        throw new Error(`Crime API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      // Aggregate by category
      const categoryCounts: Record<string, number> = {};
      data.forEach((crime: { category: string }) => {
        categoryCounts[crime.category] = (categoryCounts[crime.category] || 0) + 1;
      });

      const transformedData = {
        total_crimes: data.length,
        category_breakdown: categoryCounts,
        coordinates: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        date: params.date || new Date().toISOString().slice(0, 7),
        raw_data: data,
        last_updated: new Date().toISOString(),
      };

      // Cache successful response
      await setCachedData('crime', cacheKey, transformedData, CACHE_TTL_HOURS);

      return createSuccessResponse(transformedData, false, origin);
    } catch (apiError) {
      // If API fails, return mock data for development
      const mockData = {
        total_crimes: 0,
        category_breakdown: {},
        coordinates: {
          latitude: params.latitude,
          longitude: params.longitude,
        },
        date: params.date || new Date().toISOString().slice(0, 7),
        message: 'Crime API error. Using mock data.',
        last_updated: new Date().toISOString(),
      };

      await setCachedData('crime', cacheKey, mockData, CACHE_TTL_HOURS);
      return createSuccessResponse(mockData, false, origin);
    }
  } catch (error) {
    console.error('Crime Edge Function error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      origin
    );
  }
});

