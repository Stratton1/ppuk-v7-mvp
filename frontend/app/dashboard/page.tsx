import React from 'react';
import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { DashboardPropertyCard } from '@/components/dashboard/property-card';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { AccessCard } from '@/components/dashboard/access-card';
import { Card, CardContent } from '@/components/ui/card';
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
  role: Database['public']['Enums']['property_role_type'];
  access_expires_at: string | null;
};

const FALLBACK_IMAGE = '/placeholder.svg';

async function getCompletion(supabase: ReturnType<typeof createServerClient>, propertyId: string) {
  const completionArgs: Database['public']['Functions']['calculate_property_completion']['Args'] = {
    property_id: propertyId,
  };
  const { data, error } = await (supabase.rpc as any)('calculate_property_completion', completionArgs);
  if (error || data === null) return 0;
  return data;
}

async function getSignedUrl(
  supabase: ReturnType<typeof createServerClient>,
  bucket: string,
  path: string | null | undefined
) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export default async function DashboardPage(): Promise<React.ReactElement> {
  const userSession = await getServerUser();
  if (!userSession) {
    redirect('/auth/login');
  }
  const supabase = createServerClient();
  const userId = userSession.userId;

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
      role,
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
    accessMap.set(property.id, { property, role: 'owner', access_expires_at: null });
  });

  ((stakeholderData as StakeholderWithProperty[] | null) ?? []).forEach((stakeholder) => {
    const property = stakeholder.properties;
    if (!property) return;
    if (!accessMap.has(property.id)) {
      accessMap.set(property.id, {
        property,
        role: stakeholder.role,
        access_expires_at: stakeholder.expires_at,
      });
    }
  });

  const accessList = Array.from(accessMap.values());
  const propertyIds = accessList.map((p) => p.property.id);

  const ownedCount = accessList.filter((p) => p.role === 'owner').length;
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

  const hydrated = await Promise.all(
    accessList.map(async (entry) => {
      const completion = await getCompletion(supabase, entry.property.id);
      const media = featuredMedia.get(entry.property.id);
      const imageUrl = media
        ? (await getSignedUrl(supabase, media.storage_bucket || 'property-photos', media.storage_path)) ||
          FALLBACK_IMAGE
        : FALLBACK_IMAGE;
      return { base: entry.property, role: entry.role, accessExpiresAt: entry.access_expires_at, completion, imageUrl };
    })
  ).then((list) => list.filter((item): item is NonNullable<typeof item> => !!item));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Personalised view of your properties and recent activity.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Owned Properties" value={stats.owned_properties ?? 0} />
        <KpiCard title="Accessible Properties" value={stats.accessible_properties ?? 0} />
        <KpiCard title="Unresolved Flags" value={stats.unresolved_flags ?? 0} />
        <KpiCard title="Documents Uploaded" value={stats.total_documents ?? 0} />
      </div>

      {/* Your Properties */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Your Properties</h2>
            <p className="text-sm text-muted-foreground">Accessible passports with completion and quick actions.</p>
          </div>
        </div>
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
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground">Latest events across your accessible properties.</p>
        </div>
        <ActivityTimeline items={activity as ActivityItem[]} />
      </section>

      {/* Access Roles */}
      <section className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Your Access Roles</h2>
          <p className="text-sm text-muted-foreground">Roles granted to you with any expiry notices.</p>
        </div>
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
                role={prop.role}
                status={prop.base.status}
                accessExpiresAt={prop.accessExpiresAt}
                imageUrl={prop.imageUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
