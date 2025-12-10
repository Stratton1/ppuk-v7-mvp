/**
 * File: watchlist/page.tsx
 * Purpose: User watchlist page showing saved properties
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { getBatchSignedUrls } from '@/lib/signed-url';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyCard } from '@/components/property/property-card';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type WatchlistRow = Database['public']['Tables']['watchlist']['Row'] & {
  properties: PropertyRow | null;
};

export default async function WatchlistPage() {
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const userId = user.id;

  // Fetch watchlist entries with properties
  const { data: watchlistEntries, error } = await supabase
    .from('watchlist')
    .select(
      `
      id,
      notes,
      alert_on_changes,
      created_at,
      properties!inner(
        id, display_address, status, uprn, latitude, longitude, created_at, updated_at, deleted_at, created_by_user_id, public_slug, public_visibility
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Watchlist fetch error:', error);
  }

  const entries = (watchlistEntries as WatchlistRow[] | null) || [];
  const propertyIds = entries.map((e) => e.properties?.id).filter(Boolean) as string[];

  // Fetch featured media for properties
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <AppPageHeader
        title="My Watchlist"
        description="Properties you've saved for quick access."
      />

      <AppSection>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">No properties in watchlist</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add properties to your watchlist to access them quickly.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => {
              const property = entry.properties;
              if (!property) return null;

              return (
                <div key={entry.id} className="space-y-2">
                  <PropertyCard
                    property={property}
                    signedUrl={signedUrlMap.get(property.id) || null}
                  />
                  {entry.notes && (
                    <Card>
                      <CardContent className="py-2 px-3">
                        <p className="text-xs text-muted-foreground">{entry.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AppSection>
    </div>
  );
}

