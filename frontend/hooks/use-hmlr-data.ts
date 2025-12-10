/**
 * File: use-hmlr-data.ts
 * Purpose: React Query hook for fetching HMLR (Land Registry) data
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface HmlrData {
  success: boolean;
  data?: {
    title_number: string | null;
    tenure: string;
    price_history: Array<{
      date: string;
      price: number;
      type: string;
    }>;
    last_updated: string;
  };
  cached?: boolean;
  error?: string;
}

interface UseHmlrDataOptions {
  propertyId?: string;
  titleNumber?: string;
  uprn?: string;
  postcode?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch HMLR title data for a property
 */
export function useHmlrData(options: UseHmlrDataOptions = {}) {
  const { propertyId, titleNumber, uprn, postcode, enabled = true } = options;

  return useQuery<HmlrData>({
    queryKey: ['hmlr', propertyId, titleNumber, uprn, postcode],
    queryFn: async () => {
      if (!titleNumber && !uprn && !postcode) {
        throw new Error('At least one of titleNumber, uprn, or postcode is required');
      }

      const supabase = createClient();
      
      const { data, error } = await supabase.functions.invoke('api-hmlr', {
        body: {
          title_number: titleNumber,
          uprn,
          postcode,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch HMLR data');
      }

      return data as HmlrData;
    },
    enabled: enabled && (!!titleNumber || !!uprn || !!postcode),
    staleTime: 1000 * 60 * 60 * 24 * 30, // 1 month
    gcTime: 1000 * 60 * 60 * 24 * 30, // 1 month
  });
}

