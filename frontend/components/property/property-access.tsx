/**
 * File: property-access.tsx
 * Purpose: Display all user roles and access permissions for a property (v7 roles)
 * Type: Server Component
 */

import { Database } from '@/types/supabase';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getRoleLabel,
  getRoleIcon,
  getAccessStatus,
  getStatusVariant,
  formatExpiryDate,
  daysRemaining,
} from '@/lib/role-utils';
import { GrantAccessDialog } from './grant-access-dialog';
import { RemoveAccessDialog } from './remove-access-dialog';

type StakeholderRole = Database['public']['Tables']['property_stakeholders']['Row'];

interface PropertyAccessProps {
  propertyId: string;
}

export async function PropertyAccess({ propertyId }: PropertyAccessProps) {
  const session = await getServerUser();
  const supabase = createServerClient();

  const { data: roles, error: rolesError } = await supabase
    .from('property_stakeholders')
    .select(
      'user_id, property_id, status, permission, role, granted_by_user_id, granted_at, expires_at, created_at, deleted_at, updated_at'
    )
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (rolesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access & Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load access information: {rolesError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!roles || roles.length === 0) {
    return null;
  }

  const userIds = [...new Set(roles.map((r) => r.user_id))];
  const grantedByIds = [...new Set(roles.map((r) => r.granted_by_user_id).filter((id): id is string => !!id))];
  const allUserIds = [...new Set([...userIds, ...grantedByIds])];

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, organisation')
    .in('id', allUserIds);

  if (usersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access & Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load user information: {usersError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const userMap = new Map<string, { full_name: string | null; organisation: string | null }>();
  users?.forEach((u) => userMap.set(u.id, { full_name: u.full_name, organisation: u.organisation ?? null }));

  const aggregated = new Map<
    string,
    StakeholderRole & { statuses: Array<Database['public']['Enums']['property_status_type']>; permission: Database['public']['Enums']['property_permission_type'] | null }
  >();

  roles.forEach((role) => {
    const existing =
      aggregated.get(role.user_id) ??
      {
        ...role,
        statuses: [] as Array<Database['public']['Enums']['property_status_type']>,
        permission: null as Database['public']['Enums']['property_permission_type'] | null,
      };

    if (role.status && !existing.statuses.includes(role.status)) {
      existing.statuses.push(role.status);
    }
    if (role.permission === 'editor' || existing.statuses.includes('owner')) {
      existing.permission = 'editor';
    } else if (role.permission === 'viewer' && existing.permission !== 'editor') {
      existing.permission = 'viewer';
    }

    if (new Date(role.created_at).getTime() > new Date(existing.created_at).getTime()) {
      existing.granted_at = role.granted_at;
      existing.granted_by_user_id = role.granted_by_user_id;
      existing.expires_at = role.expires_at;
      existing.created_at = role.created_at;
    }

    aggregated.set(role.user_id, existing);
  });

  const accessList = Array.from(aggregated.values()).map((entry) => ({
    ...entry,
    user: userMap.get(entry.user_id),
    grantedByUser: entry.granted_by_user_id
      ? { full_name: userMap.get(entry.granted_by_user_id)?.full_name || null }
      : null,
  }));

  const canManageRoles = session?.isAdmin
    ? true
    : session?.id
    ? accessList.some((r) => r.user_id === session.id && r.statuses.includes('owner'))
    : false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Access & Roles</CardTitle>
            <p className="text-sm text-muted-foreground">
              {accessList.length} {accessList.length === 1 ? 'person has' : 'people have'} access to this property
            </p>
          </div>
          {canManageRoles && (
            <GrantAccessDialog propertyId={propertyId}>
              <Button size="sm">Grant Access</Button>
            </GrantAccessDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {accessList.length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No access records found for this property.
          </div>
        )}

        {accessList.map((roleAssignment) => {
          const status = getAccessStatus(roleAssignment.expires_at);
          const days = daysRemaining(roleAssignment.expires_at);
          const revokeStatus = roleAssignment.statuses.includes('owner')
            ? 'owner'
            : roleAssignment.statuses[0] ?? null;

          return (
            <div
              key={`${roleAssignment.user_id}-${roleAssignment.property_id}`}
              className="flex items-start justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{roleAssignment.user?.full_name || 'Unknown User'}</p>
                  <Badge variant={getStatusVariant(status)} className="text-xs capitalize">
                    {status}
                  </Badge>
                </div>

                {roleAssignment.user?.organisation && (
                  <p className="text-xs text-muted-foreground">{roleAssignment.user.organisation}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {roleAssignment.statuses.map((s) => (
                    <Badge key={s} variant="outline" className="capitalize">
                      {getRoleIcon(s)} {getRoleLabel(s)}
                    </Badge>
                  ))}
                  {roleAssignment.permission && (
                    <Badge variant="secondary" className="capitalize">
                      {getRoleIcon(roleAssignment.permission)} {getRoleLabel(roleAssignment.permission)}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {roleAssignment.grantedByUser?.full_name && (
                    <span>Granted by {roleAssignment.grantedByUser.full_name}</span>
                  )}
                  <span>
                    on{' '}
                    {new Date(roleAssignment.granted_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {roleAssignment.expires_at ? (
                    <span className={days !== null && days < 0 ? 'text-destructive' : ''}>
                      {formatExpiryDate(roleAssignment.expires_at)}
                    </span>
                  ) : (
                    <span className="font-medium text-green-600 dark:text-green-400">Permanent access</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {days !== null && days >= 0 && days <= 7 && (
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    {days} {days === 1 ? 'day' : 'days'} left
                  </span>
                )}
                {days !== null && days < 0 && (
                  <span className="text-xs font-medium text-destructive">Expired</span>
                )}

                {canManageRoles && revokeStatus && (
                  <RemoveAccessDialog
                    propertyId={propertyId}
                    userId={roleAssignment.user_id}
                    userName={roleAssignment.user?.full_name || 'Unknown User'}
                    status={revokeStatus}
                    permission={roleAssignment.permission}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </RemoveAccessDialog>
                )}
              </div>
            </div>
          );
        })}

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Access permissions are enforced via RLS. Owners can grant or revoke access; public visibility allows
            read-only access for everyone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
