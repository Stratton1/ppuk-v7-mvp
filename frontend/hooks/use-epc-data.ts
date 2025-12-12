/**
 * File: use-epc-data.ts
 * Purpose: React Query hook for fetching EPC data
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface EpcData {
  success: boolean;
  data?: {
    message?: string;
    data?: Array<{
      'lodgement-date'?: string;
      'current-energy-rating'?: string;
      'current-energy-efficiency'?: number;
      'total-floor-area'?: number;
      'main-fuel-type'?: string;
      'main-heating-description'?: string;
      address?: string;
      postcode?: string;
    }>;
  };
  cached?: boolean;
  error?: string;
}

interface UseEpcDataOptions {
  propertyId?: string;
  uprn?: string;
  postcode?: string;
  address?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch EPC data for a property
 */
export function useEpcData(options: UseEpcDataOptions = {}) {
  const { propertyId, uprn, postcode, address, enabled = true } = options;

  return useQuery<EpcData>({
    queryKey: ['epc', propertyId, uprn, postcode, address],
    queryFn: async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase.functions.invoke('api-epc', {
        body: {
          uprn,
          postcode,
          address,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch EPC data');
      }

      return data as EpcData;
    },
    enabled: enabled && (!!uprn || !!postcode || !!address),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
  });
}

