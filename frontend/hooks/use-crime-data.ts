/**
 * File: use-crime-data.ts
 * Purpose: React Query hook for fetching crime statistics
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface CrimeData {
  success: boolean;
  data?: {
    total_crimes: number;
    category_breakdown: Record<string, number>;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    date: string;
    last_updated: string;
  };
  cached?: boolean;
  error?: string;
}

interface UseCrimeDataOptions {
  propertyId?: string;
  latitude?: number;
  longitude?: number;
  date?: string; // YYYY-MM format
  enabled?: boolean;
}

/**
 * Hook to fetch crime data for a property location
 */
export function useCrimeData(options: UseCrimeDataOptions = {}) {
  const { propertyId, latitude, longitude, date, enabled = true } = options;

  return useQuery<CrimeData>({
    queryKey: ['crime-data', propertyId, latitude, longitude, date],
    queryFn: async () => {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }

      const supabase = createClient();
      
      const { data, error } = await supabase.functions.invoke('api-crime', {
        body: {
          latitude,
          longitude,
          date,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch crime data');
      }

      return data as CrimeData;
    },
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
  });
}

