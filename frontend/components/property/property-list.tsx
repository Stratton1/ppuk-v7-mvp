/**
 * File: property-list.tsx
 * Purpose: Fetch and display grid of all active properties with pagination
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { PropertyCard } from './property-card';
import { getBatchSignedUrls } from '@/lib/signed-url';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PropertyListProps {
  page?: number;
  pageSize?: number;
}

export async function PropertyList({ page = 1, pageSize = 20 }: PropertyListProps = {}) {
  // Create Supabase client (server-side)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const offset = (page - 1) * pageSize;

  // Fetch paginated active properties
  const { data: properties, error: propertiesError, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

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

  // Batch fetch featured media for all properties
  const propertyIds = properties?.map(p => p.id) || [];
  const { data: mediaRows } = propertyIds.length > 0
    ? await supabase
        .from('media')
        .select('property_id, storage_path, storage_bucket')
        .in('property_id', propertyIds)
        .eq('status', 'active')
        .eq('media_type', 'photo')
        .order('created_at', { ascending: true })
    : { data: [] };

  // Group media by property (first photo per property)
  const featuredMediaMap = new Map<string, { storage_path: string; storage_bucket: string }>();
  const seenProperties = new Set<string>();
  mediaRows?.forEach((media) => {
    if (!seenProperties.has(media.property_id)) {
      featuredMediaMap.set(media.property_id, {
        storage_path: media.storage_path,
        storage_bucket: media.storage_bucket || 'property-photos',
      });
      seenProperties.add(media.property_id);
    }
  });

  // Batch generate signed URLs
  const signedUrlPaths = Array.from(featuredMediaMap.entries()).map(([propertyId, media]) => ({
    bucket: media.storage_bucket,
    path: media.storage_path,
    propertyId,
  }));

  const signedUrls = await getBatchSignedUrls(supabase, signedUrlPaths.map(({ bucket, path }) => ({ bucket, path })));
  const signedUrlMap = new Map<string, string | null>();
  signedUrlPaths.forEach(({ bucket, path, propertyId }) => {
    const key = `${bucket}:${path}`;
    signedUrlMap.set(propertyId, signedUrls.get(key) || null);
  });

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            signedUrl={signedUrlMap.get(property.id) || null} 
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1} to {Math.min(offset + pageSize, count || 0)} of {count || 0} properties
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`?page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
