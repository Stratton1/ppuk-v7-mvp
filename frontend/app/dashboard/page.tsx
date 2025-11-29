import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { DashboardPropertyCard } from '@/components/dashboard/property-card';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { AccessCard } from '@/components/dashboard/access-card';
import { Card, CardContent } from '@/components/ui/card';
import type { Database } from '@/types/supabase';

type ActivityItem = Database['public']['Functions']['get_recent_activity']['Returns'][number];
type StatsItem = Database['public']['Functions']['get_dashboard_stats']['Returns'][number];
type UserProperty = Database['public']['Functions']['get_user_properties']['Returns'][number];

const FALLBACK_IMAGE = '/placeholder.svg';

async function getCompletion(supabase: ReturnType<typeof createServerSupabaseClient>, propertyId: string) {
  const completionArgs: Database['public']['Functions']['calculate_property_completion']['Args'] = {
    property_id: propertyId,
  };
  // Type assertion needed due to Supabase RPC type inference issue
  const { data, error } = await (supabase.rpc as any)('calculate_property_completion', completionArgs);
  if (error || data === null) return 0;
  return data;
}

async function getSignedUrl(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  bucket: string,
  path: string | null | undefined
) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export default async function DashboardPage(): Promise<React.ReactElement> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const userPropertiesArgs: Database['public']['Functions']['get_user_properties']['Args'] = {
    user_id: user.id,
  };
  const recentActivityArgs: Database['public']['Functions']['get_recent_activity']['Args'] = {
    auth_uid: user.id,
  };
  const dashboardStatsArgs: Database['public']['Functions']['get_dashboard_stats']['Args'] = {
    auth_uid: user.id,
  };

  // Type assertions needed due to Supabase RPC type inference issues
  const [{ data: propertiesData }, { data: activityData }, { data: statsData }] = await Promise.all([
    (supabase.rpc as any)('get_user_properties', userPropertiesArgs),
    (supabase.rpc as any)('get_recent_activity', recentActivityArgs),
    (supabase.rpc as any)('get_dashboard_stats', dashboardStatsArgs),
  ]);

  const properties: UserProperty[] = (propertiesData as UserProperty[]) ?? [];
  const activity: ActivityItem[] = (activityData as ActivityItem[]) ?? [];
  const stats = (statsData && statsData[0]) || ({} as StatsItem);

  const propertyIds = properties.map((p: UserProperty) => p.property_id);
  const { data: baseProperties } = propertyIds.length
    ? await supabase
        .from('properties')
        .select('id, display_address, status, uprn, latitude, longitude, created_at, updated_at, deleted_at, created_by_user_id')
        .in('id', propertyIds)
    : { data: [] as Database['public']['Tables']['properties']['Row'][] | null };

  const baseMap = new Map((baseProperties ?? []).map((p) => [p.id, p]));

  const hydrated = await Promise.all(
    properties.map(async (prop) => {
      const base = baseMap.get(prop.property_id);
      if (!base) return null;
      const completion = await getCompletion(supabase, prop.property_id);
      const imageUrl =
        (await getSignedUrl(supabase, 'property-photos', prop.featured_media_storage_path)) || FALLBACK_IMAGE;
      return { base, access: prop, completion, imageUrl };
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
        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">No access granted yet.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hydrated.map((prop) => (
              <AccessCard
                key={prop.base.id}
                displayAddress={prop.base.display_address}
                role={prop.access.role}
                status={prop.base.status}
                accessExpiresAt={prop.access.access_expires_at}
                imageUrl={prop.imageUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
