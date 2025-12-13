import { Suspense, use, type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PropertyHeader } from '@/components/property/property-header';
import { PropertyTabs } from '@/components/property/PropertyTabs';
import { canViewDocumentsUI, canViewIssuesUI, canViewMediaUI, type DashboardRole } from '@/lib/roles/domain';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import type { Database } from '@/types/supabase';

type PropertyLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

/**
 * Property Layout - Server Component
 * Auth is enforced by middleware. Do NOT add auth checks here.
 */
export default async function PropertyLayout({ children, params }: PropertyLayoutProps) {
  const { id } = use(params);
  const supabase = await createClient();

  // Get user info for permissions (not auth enforcement - middleware handles that)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: userRow } = authUser
    ? await supabase.from('users').select('id, primary_role').eq('id', authUser.id).maybeSingle()
    : { data: null };

  const isAdmin = userRow?.primary_role === 'admin';

  // Get user's property roles for permission checks
  const { data: stakeholderRows } = authUser
    ? await supabase
        .from('property_stakeholders')
        .select('property_id, status, permission')
        .eq('user_id', authUser.id)
        .is('deleted_at', null)
    : { data: null };

  const propertyRoles: Record<string, { status: string[]; permission: string | null }> = {};
  (stakeholderRows ?? []).forEach((row) => {
    const current = propertyRoles[row.property_id] ?? { status: [], permission: null };
    if (row.status && !current.status.includes(row.status)) {
      current.status.push(row.status);
    }
    if (row.permission === 'editor') {
      current.permission = 'editor';
    } else if (row.permission === 'viewer' && current.permission !== 'editor') {
      current.permission = 'viewer';
    }
    propertyRoles[row.property_id] = current;
  });

  const primaryRole = userRow?.primary_role ?? null;
  const role: DashboardRole = isAdmin
    ? 'admin'
    : primaryRole === 'agent'
    ? 'agent'
    : primaryRole === 'conveyancer'
    ? 'conveyancer'
    : Object.values(propertyRoles).some((r) => r.status.includes('owner'))
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

  let canView = false;
  try {
    const { data } = await supabase.rpc('can_view_property', { property_id: id });
    canView = Boolean(data);
  } catch {
    canView = false;
  }
  if (!canView && !isAdmin) {
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
  const propertyRoleInfo = propertyRoles[id];
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
