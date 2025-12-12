import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { PropertyHeader } from '@/components/property/property-header';
import { PropertyTabs } from '@/components/property/PropertyTabs';
import { getSessionOrRedirect } from '@/lib/auth/server-user';
import { canViewDocumentsUI, canViewIssuesUI, canViewMediaUI, type DashboardRole } from '@/lib/roles/domain';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import type { Database } from '@/types/supabase';

type PropertyLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function PropertyLayout({ children, params }: PropertyLayoutProps) {
  const { id } = await params;
  const supabase = createServerClient();
  const user = await getSessionOrRedirect({ redirectTo: `/properties/${id}` });
  const role: DashboardRole = user?.isAdmin
    ? 'admin'
    : user?.primary_role === 'agent'
    ? 'agent'
    : user?.primary_role === 'conveyancer'
    ? 'conveyancer'
    : user && Object.values(user.property_roles || {}).some((r) => r.status.includes('owner'))
    ? 'owner'
    : 'buyer';

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!property) {
    notFound();
  }

  const { data: canView } = await supabase.rpc('can_view_property', { property_id: id }).catch(() => ({ data: null }));
  if (!canView && !user.isAdmin) {
    return (
      <AccessUnavailable
        title="Access restricted"
        description="You do not have permission to view this Property Passport."
        optionalActionLabel="Go to dashboard"
        optionalActionHref="/dashboard"
      />
    );
  }

  const { data: media } = await supabase
    .from('media')
    .select('id, storage_path')
    .eq('property_id', id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1);

  const propertyTyped = property as Database['public']['Tables']['properties']['Row'];
  const featuredMedia = (media ?? [])[0] ?? null;
  const propertyRoleInfo = user?.property_roles?.[id];
  const hasEditorPermission =
    Boolean(propertyRoleInfo?.permission === 'editor') || Boolean(propertyRoleInfo?.status?.includes('owner'));
  const hasViewerPermission =
    hasEditorPermission ||
    Boolean(
      propertyRoleInfo?.permission === 'viewer' ||
        propertyRoleInfo?.status?.includes('buyer') ||
        propertyRoleInfo?.status?.includes('tenant')
    );

  const canViewMedia = canViewMediaUI(role) || hasViewerPermission || hasEditorPermission;
  const canViewDocs = canViewDocumentsUI(role) || hasViewerPermission || hasEditorPermission;
  const canViewIssues = canViewIssuesUI(role) || hasViewerPermission || hasEditorPermission;

  const allowedTabs = [
    'overview',
    'details',
    ...(canViewMedia ? ['media'] : []),
    ...(canViewDocs ? ['documents'] : []),
    ...(canViewIssues ? ['issues'] : []),
    'tasks',
    'history',
  ];

  return (
    <div className="space-y-6">
      <PropertyHeader property={propertyTyped} featuredMedia={featuredMedia} />
      <PropertyTabs propertyId={id} allowedTabs={allowedTabs} />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading property…</div>}>{children}</Suspense>
    </div>
  );
}
