/**
 * File: use-flood-risk.ts
 * Purpose: React Query hook for fetching flood risk data
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface FloodRiskData {
  success: boolean;
  data?: {
    risk_level: 'low' | 'medium' | 'high' | 'very_high';
    risk_details?: Record<string, unknown>;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    last_updated: string;
  };
  cached?: boolean;
  error?: string;
}

interface UseFloodRiskOptions {
  propertyId?: string;
  latitude?: number;
  longitude?: number;
  uprn?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch flood risk data for a property
 */
export function useFloodRisk(options: UseFloodRiskOptions = {}) {
  const { propertyId, latitude, longitude, uprn, enabled = true } = options;

  return useQuery<FloodRiskData>({
    queryKey: ['flood-risk', propertyId, latitude, longitude, uprn],
    queryFn: async () => {
      if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
      }

      const supabase = createClient();
      
      const { data, error } = await supabase.functions.invoke('api-flood', {
        body: {
          latitude,
          longitude,
          uprn,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch flood risk data');
      }

      return data as FloodRiskData;
    },
    enabled: enabled && !!latitude && !!longitude,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 1 month
    gcTime: 1000 * 60 * 60 * 24 * 30, // 1 month
  });
}

