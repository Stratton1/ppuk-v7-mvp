import React from 'react';
import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { getBatchSignedUrls } from '@/lib/signed-url';
import { flagRowToIssue, type Issue } from '@/lib/issues/types';
import { docRowToUidDocument, type UidDocument } from '@/lib/documents/types';
import { mediaRowToUidMedia, type UidMedia } from '@/lib/media/types';
import { eventRowToEntry, type TimelineEntry } from '@/lib/events/types';
import { getDashboardConfig } from '@/components/dashboard/getDashboardConfig';
import type { DashboardRole } from '@/lib/roles/domain';
import { DashboardTabsClient } from './TabsClient';
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
  const role: DashboardRole = userSession.isAdmin
    ? 'admin'
    : userSession.primary_role === 'agent'
    ? 'agent'
    : userSession.primary_role === 'conveyancer'
    ? 'conveyancer'
    : ownedCount > 0
    ? 'owner'
    : 'buyer';
  const dashboardConfig = getDashboardConfig(role);

  const { count: documentsCount } = propertyIds.length
    ? await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .in('property_id', propertyIds)
        .is('deleted_at', null)
    : { count: 0 };

  const stats = {
    ownedProperties: ownedCount,
    accessibleProperties: accessibleCount,
    unresolvedFlags: 0,
    totalDocuments: documentsCount ?? 0,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: eventRows } = propertyIds.length
    ? await (supabase as any)
        .from('property_events')
        .select('property_id, event_type, created_at, actor_user_id, event_payload')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false })
        .limit(100)
    : {
        data: [] as any[],
      };

  const activity: ActivityItem[] =
    (eventRows ?? []).map((event: any) => ({
      property_id: event.property_id,
      property_address: 'Property',
      event_type: event.event_type,
      created_at: event.created_at,
    })) ?? [];
  const timelineEntries: TimelineEntry[] = (eventRows || []).map((row: unknown) => eventRowToEntry(row as any));

  // Batch fetch completion scores for all properties
  const completionMap = new Map<string, number>();
  if (propertyIds.length > 0) {
    // Note: get_properties_completion RPC function may not exist in schema yet - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: completionData, error: completionError } = await (supabase as any).rpc(
      'get_properties_completion',
      { property_ids: propertyIds }
    );

    if (!completionError && completionData) {
      (completionData as { property_id: string; completion: number }[]).forEach((row) => {
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
    const imageUrl = media ? signedUrlMap.get(entry.property.id) || FALLBACK_IMAGE : FALLBACK_IMAGE;

    return {
      base: entry.property,
      statuses: entry.statuses,
      permission: entry.permission,
      accessExpiresAt: entry.access_expires_at,
      completion,
      imageUrl,
    };
  });

  const propertySummaries = hydrated.map((item) => ({
    property: item.base,
    completion: item.completion,
    imageUrl: item.imageUrl,
  }));
  const propertiesWithMeta = propertySummaries.map((item) => ({
    ...item.property,
    completion: item.completion,
    imageUrl: item.imageUrl,
  }));
  const recommended = propertiesWithMeta
    .slice()
    .sort((a, b) => new Date(b.updated_at ?? b.created_at ?? '').getTime() - new Date(a.updated_at ?? a.created_at ?? '').getTime())
    .slice(0, 5);

  // Fetch issues for accessible properties (UI-level mapping over property_flags)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: issueRows } = propertyIds.length
    ? await (supabase as any)
        .from('property_flags')
        .select('*')
        .in('property_id', propertyIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] as Issue[] };

  const issues: Issue[] = (issueRows || []).map(flagRowToIssue);

  // Documents & media for dashboard widgets
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: documentRows } = propertyIds.length
    ? await (supabase as any)
        .from('documents')
        .select('*')
        .in('property_id', propertyIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] as UidDocument[] };

  const documents: UidDocument[] = documentRows
    ? await Promise.all(documentRows.map((row: unknown) => docRowToUidDocument(row as any)))
    : [];

  const recentMedia: UidMedia[] = mediaRows
    ? await Promise.all(mediaRows.slice(0, 6).map((row) => mediaRowToUidMedia(row as any)))
    : [];

  return (
    <div className="space-y-6" data-testid="dashboard-root">
      <div data-testid="dashboard-loaded" className="hidden" />
      <AppPageHeader
        title="Dashboard"
        description="Personalised view of your properties, access, and recent activity."
      />
      <DashboardTabsClient
        role={role}
        config={dashboardConfig}
        stats={stats}
        properties={propertiesWithMeta}
        recommended={recommended}
        invitations={[]}
        issues={issues}
        documents={documents}
        recentMedia={recentMedia}
        activity={activity as ActivityItem[]}
        timeline={timelineEntries}
      />
    </div>
  );
}
