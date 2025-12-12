/**
 * File: watchlist/page.tsx
 * Purpose: User watchlist page showing saved properties
 */

import { use } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { getBatchSignedUrls } from '@/lib/signed-url';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyCard } from '@/components/property/property-card';
import { AccessUnavailable } from '@/components/ui/AccessUnavailable';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type WatchlistRow = {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
  properties?: PropertyRow | null;
};
type WatchlistEntry = WatchlistRow & {
  notes?: string | null;
  alert_on_changes?: boolean | null;
};

export default async function WatchlistPage({ params }: { params: Promise<Record<string, never>> }) {
  const resolved = use(params);
  void resolved;

  const user = await getServerUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const userId = user.id;

  // Fetch watchlist entries with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: watchlist } = await (supabase as any)
    .from('watchlist')
    .select('*, properties (*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .catch((err: unknown) => {
      console.error('Watchlist fetch error:', err);
      return { data: [] };
    });

  const entries = (watchlist as WatchlistEntry[] | null) || [];
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
          <AccessUnavailable
            title="No properties in watchlist"
            description="Add properties to your watchlist to access them quickly."
            dataTestId="watchlist-empty"
          />
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
