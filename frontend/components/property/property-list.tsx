/**
 * File: property-list.tsx
 * Purpose: Fetch and display grid of all active properties
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { PropertyCard } from './property-card';
import { getFeaturedMediaUrl } from '@/lib/signed-url';

export async function PropertyList() {
  // Create Supabase client (server-side)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all active properties
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Handle error state
  if (propertiesError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Failed to load properties
          </p>
          <p className="text-sm text-muted-foreground">
            {propertiesError.message}
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!properties || properties.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">No properties found</p>
          <p className="text-sm text-muted-foreground">
            Check back soon for new listings
          </p>
        </div>
      </div>
    );
  }

  // Fetch featured media (first active photo) for each property
  const propertiesWithMedia = await Promise.all(
    properties.map(async (property) => {
      const { data: media } = await supabase
        .from('media')
        .select('id, storage_path')
        .eq('property_id', property.id)
        .eq('status', 'active')
        .eq('media_type', 'photo')
        .order('created_at', { ascending: true })
        .limit(1);

      let signedUrl: string | null = null;
      if (media && media.length > 0) {
        signedUrl = await getFeaturedMediaUrl(media[0].storage_path);
      }

      return {
        property,
        featuredMedia: media?.[0] || null,
        signedUrl,
      };
    })
  );

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Active Properties</h1>
        <p className="mt-2 text-muted-foreground">
          Browse all available properties in the Property Passport UK system
        </p>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {propertiesWithMedia.map(({ property, signedUrl }) => (
          <PropertyCard key={property.id} property={property} signedUrl={signedUrl} />
        ))}
      </div>

      {/* Results Count */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
      </div>
    </div>
  );
}
