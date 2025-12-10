import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { DashboardPropertyCard } from '@/components/dashboard/property-card';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { AccessCard } from '@/components/dashboard/access-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { AppKPI } from '@/components/app/AppKPI';
import { getBatchSignedUrls } from '@/lib/signed-url';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type StakeholderWithProperty = Database['public']['Tables']['property_stakeholders']['Row'] & {
  properties: PropertyRow | null;
};
type MediaRow = Pick<
  Database['public']['Tables']['media']['Row'],
  'property_id' | 'storage_path' | 'storage_bucket' | 'created_at' | 'deleted_at' | 'media_type'
>;
type ActivityItem = {
  property_id: string;
  property_address: string;
  event_type: string;
  created_at: string;
};
type AccessEntry = {
  property: PropertyRow;
  statuses: Database['public']['Enums']['property_status_type'][];
  permission: Database['public']['Enums']['property_permission_type'] | null;
  access_expires_at: string | null;
};

const FALLBACK_IMAGE = '/placeholder.svg';

export default async function DashboardPage(): Promise<React.ReactElement> {
  let userSession = null;
  try {
    userSession = await getServerUser();
  } catch (error) {
    if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === 'true') {
      console.error('AUTH DEBUG USER FETCH ERROR', error);
    }
  }

  if (!userSession) {
    redirect('/auth/login');
  }
  const supabase = createServerClient();
  const userId = userSession.id;

  const { data: ownedProperties } = await supabase
    .from('properties')
    .select(
      'id, display_address, status, uprn, latitude, longitude, created_at, updated_at, deleted_at, created_by_user_id, public_slug, public_visibility'
    )
    .eq('created_by_user_id', userId)
    .is('deleted_at', null);

  const { data: stakeholderData } = await supabase
    .from('property_stakeholders')
    .select(
      `
      property_id,
      status,
      permission,
      expires_at,
      properties!inner(
        id, display_address, status, uprn, latitude, longitude, created_at, updated_at, deleted_at, created_by_user_id, public_slug, public_visibility
      )
    `
    )
    .eq('user_id', userId)
    .is('deleted_at', null);

  const accessMap = new Map<string, AccessEntry>();

  (ownedProperties ?? []).forEach((property) => {
    accessMap.set(property.id, { property, statuses: ['owner'], permission: 'editor', access_expires_at: null });
  });

  ((stakeholderData as StakeholderWithProperty[] | null) ?? []).forEach((stakeholder) => {
    const property = stakeholder.properties;
    if (!property) return;
    const existing = accessMap.get(property.id) ?? {
      property,
      statuses: [] as AccessEntry['statuses'],
      permission: null as AccessEntry['permission'],
      access_expires_at: null as AccessEntry['access_expires_at'],
    };

    if (stakeholder.status && !existing.statuses.includes(stakeholder.status)) {
      existing.statuses.push(stakeholder.status);
    }

    if (stakeholder.permission === 'editor' || existing.statuses.includes('owner')) {
      existing.permission = 'editor';
    } else if (stakeholder.permission === 'viewer' && existing.permission !== 'editor') {
      existing.permission = 'viewer';
    }

    if (stakeholder.expires_at) {
      if (!existing.access_expires_at || new Date(stakeholder.expires_at) < new Date(existing.access_expires_at)) {
        existing.access_expires_at = stakeholder.expires_at;
      }
    }

    accessMap.set(property.id, existing);
  });

  const accessList = Array.from(accessMap.values());
  const propertyIds = accessList.map((p) => p.property.id);

  const ownedCount = accessList.filter((p) => p.statuses.includes('owner')).length;
  const accessibleCount = accessList.length;

  const { count: documentsCount } = propertyIds.length
    ? await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .in('property_id', propertyIds)
        .is('deleted_at', null)
    : { count: 0 };

  const stats = {
    owned_properties: ownedCount,
    accessible_properties: accessibleCount,
    unresolved_flags: 0,
    total_documents: documentsCount ?? 0,
  };

  const { data: mediaRows } = propertyIds.length
    ? await supabase
        .from('media')
        .select('property_id, storage_path, storage_bucket, created_at, deleted_at, media_type')
        .in('property_id', propertyIds)
        .eq('media_type', 'photo')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
    : { data: [] as MediaRow[] | null };

  const featuredMedia = new Map<string, MediaRow>();
  (mediaRows ?? []).forEach((row) => {
    if (!featuredMedia.has(row.property_id)) {
      featuredMedia.set(row.property_id, row);
    }
  });

  const { data: eventRows } = propertyIds.length
    ? await supabase
        .from('property_events')
        .select('property_id, event_type, created_at, properties!inner(display_address)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(100)
    : {
        data: [] as (Database['public']['Tables']['property_events']['Row'] & {
          properties: { display_address?: string } | null;
        })[] | null,
      };

  const activity: ActivityItem[] =
    (eventRows ?? []).map((event) => ({
      property_id: event.property_id,
      property_address: (event.properties as { display_address?: string } | null)?.display_address ?? 'Unknown property',
      event_type: event.event_type,
      created_at: event.created_at,
    })) ?? [];

  // Batch fetch completion scores for all properties
  const completionMap = new Map<string, number>();
  if (propertyIds.length > 0) {
    const batchCompletionArgs: Database['public']['Functions']['get_properties_completion']['Args'] = {
      property_ids: propertyIds,
    };
    const { data: completionData, error: completionError } = await supabase.rpc(
      'get_properties_completion',
      batchCompletionArgs
    );
    
    if (!completionError && completionData) {
      completionData.forEach((row) => {
        completionMap.set(row.property_id, row.completion);
      });
    }
  }

  // Batch generate signed URLs for all featured media
  const signedUrlPaths = Array.from(featuredMedia.entries()).map(([propertyId, media]) => ({
    bucket: media.storage_bucket || 'property-photos',
    path: media.storage_path,
    propertyId,
  }));

  const signedUrls = await getBatchSignedUrls(supabase, signedUrlPaths.map(({ bucket, path }) => ({ bucket, path })));
  
  // Map signed URLs back to properties
  const signedUrlMap = new Map<string, string>();
  signedUrlPaths.forEach(({ bucket, path, propertyId }, index) => {
    const key = `${bucket}:${path}`;
    const url = signedUrls.get(key);
    if (url) {
      signedUrlMap.set(propertyId, url);
    }
  });

  // Hydrate access list with batched data
  const hydrated = accessList.map((entry) => {
    const completion = completionMap.get(entry.property.id) ?? 0;
    const media = featuredMedia.get(entry.property.id);
    const imageUrl = media
      ? signedUrlMap.get(entry.property.id) || FALLBACK_IMAGE
      : FALLBACK_IMAGE;
    
    return {
      base: entry.property,
      statuses: entry.statuses,
      permission: entry.permission,
      accessExpiresAt: entry.access_expires_at,
      completion,
      imageUrl,
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6" data-testid="dashboard-root">
      <div data-testid="dashboard-loaded" className="hidden" />
      <AppPageHeader
        title="Dashboard"
        description="Personalised view of your properties, access, and recent activity."
        actions={
          <Button asChild size="sm">
            <Link href="/properties/create">Add property</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AppKPI label="Owned Properties" value={stats.owned_properties ?? 0} hint="You created these passports" />
        <AppKPI label="Accessible Properties" value={stats.accessible_properties ?? 0} hint="Shared with you" />
        <AppKPI label="Unresolved Flags" value={stats.unresolved_flags ?? 0} hint="Issues to review" />
        <AppKPI label="Documents Uploaded" value={stats.total_documents ?? 0} hint="Across your properties" />
      </div>

      <AppSection
        title="Your Properties"
        description="Accessible passports with completion and quick actions."
        actions={
          hydrated.length > 0 ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/properties">View all</Link>
            </Button>
          ) : null
        }
      >
        <div data-testid="properties-list">
          {hydrated.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">No properties found.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hydrated.map((prop) => (
                <DashboardPropertyCard
                  key={prop.base.id}
                  property={prop.base}
                  completion={prop.completion}
                  imageUrl={prop.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </AppSection>

      <AppSection title="Recent Activity" description="Latest events across your accessible properties.">
        <ActivityTimeline items={activity as ActivityItem[]} />
      </AppSection>

      <AppSection title="Your Access Roles" description="Roles granted to you with any expiry notices.">
        {hydrated.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">No access granted yet.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hydrated.map((prop) => (
              <AccessCard
                key={prop.base.id}
                displayAddress={prop.base.display_address}
                statuses={prop.statuses}
                permission={prop.permission}
                status={prop.base.status}
                accessExpiresAt={prop.accessExpiresAt}
                imageUrl={prop.imageUrl}
              />
            ))}
          </div>
        )}
      </AppSection>
    </div>
  );
}
