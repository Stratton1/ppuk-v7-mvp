/**
 * File: property-access.tsx
 * Purpose: Display all user roles and access permissions for a property
 * Type: Server Component
 * Security: RLS automatically filters roles based on user permissions
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
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
  sortRoles,
} from '@/lib/role-utils';
import { GrantAccessDialog } from './grant-access-dialog';
import { RemoveAccessDialog } from './remove-access-dialog';

type UserPropertyRole = Database['public']['Tables']['user_property_roles']['Row'];
type UserExtended = Database['public']['Tables']['users_extended']['Row'];

interface RoleWithUser extends UserPropertyRole {
  user?: Pick<UserExtended, 'full_name' | 'organisation' | 'primary_role'> | null;
  grantedByUser?: Pick<UserExtended, 'full_name'> | null;
}

interface PropertyAccessProps {
  propertyId: string;
}

export async function PropertyAccess({ propertyId }: PropertyAccessProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user can manage roles (owner or admin only)
  const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
    property_id: propertyId,
    allowed_roles: ['owner', 'admin'],
  };
  const { data: canManageRoles } = await supabase.rpc('has_property_role', hasPropertyRoleArgs);

  // Fetch all property roles
  // RLS will automatically filter based on user's permissions
  const { data: roles, error: rolesError } = await supabase
    .from('user_property_roles')
    .select('*')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false});

  // Handle error
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

  // Handle empty state (no roles visible to this user)
  if (!roles || roles.length === 0) {
    return null; // Hide panel entirely if no roles are visible
  }

  // Fetch user information for all unique user_ids
  const userIds = [...new Set(roles.map((r) => r.user_id))];
  const grantedByIds = [
    ...new Set(roles.map((r) => r.granted_by_user_id).filter((id): id is string => id !== null)),
  ];
  const allUserIds = [...new Set([...userIds, ...grantedByIds])];

  const { data: users } = await supabase
    .from('users_extended')
    .select('user_id, full_name, organisation, primary_role')
    .in('user_id', allUserIds);

  // Create user lookup map
  const userMap = new Map<string, Pick<UserExtended, 'full_name' | 'organisation' | 'primary_role'>>();
  users?.forEach((u) => {
    userMap.set(u.user_id, {
      full_name: u.full_name,
      organisation: u.organisation,
      primary_role: u.primary_role,
    });
  });

  // Merge roles with user information
  const rolesWithUsers: RoleWithUser[] = roles.map((role) => ({
    ...role,
    user: userMap.get(role.user_id),
    grantedByUser: role.granted_by_user_id
      ? { full_name: userMap.get(role.granted_by_user_id)?.full_name || null }
      : null,
  }));

  // Group roles by role type
  const rolesByType = rolesWithUsers.reduce((acc, role) => {
    const type = role.role;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(role);
    return acc;
  }, {} as Record<string, RoleWithUser[]>);

  // Sort role types by priority
  const sortedRoleTypes = sortRoles(Object.keys(rolesByType));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Access & Roles</CardTitle>
            <p className="text-sm text-muted-foreground">
              {roles.length} {roles.length === 1 ? 'person has' : 'people have'} access to this property
            </p>
          </div>
          {canManageRoles && (
            <GrantAccessDialog propertyId={propertyId}>
              <Button size="sm">Grant Access</Button>
            </GrantAccessDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedRoleTypes.map((roleType) => {
          const roleList = rolesByType[roleType];

          return (
            <div key={roleType} className="space-y-3">
              {/* Role Type Header */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{getRoleIcon(roleType)}</span>
                <h3 className="font-semibold">{getRoleLabel(roleType)}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {roleList.length}
                </Badge>
              </div>

              {/* Users with this role */}
              <div className="space-y-2">
                {roleList.map((roleAssignment) => {
                  const status = getAccessStatus(roleAssignment.expires_at);
                  const days = daysRemaining(roleAssignment.expires_at);

                  return (
                    <div
                      key={roleAssignment.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      {/* User Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {roleAssignment.user?.full_name || 'Unknown User'}
                          </p>
                          <Badge variant={getStatusVariant(status)} className="text-xs capitalize">
                            {status}
                          </Badge>
                        </div>

                        {/* Organisation (for professionals) */}
                        {roleAssignment.user?.organisation && (
                          <p className="text-xs text-muted-foreground">
                            {roleAssignment.user.organisation}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {/* Granted by */}
                          {roleAssignment.grantedByUser?.full_name && (
                            <span>Granted by {roleAssignment.grantedByUser.full_name}</span>
                          )}

                          {/* Granted date */}
                          <span>
                            on{' '}
                            {new Date(roleAssignment.granted_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>

                          {/* Expiry info */}
                          {roleAssignment.expires_at && (
                            <span className={days !== null && days < 0 ? 'text-destructive' : ''}>
                              {formatExpiryDate(roleAssignment.expires_at)}
                            </span>
                          )}

                          {!roleAssignment.expires_at && (
                            <span className="font-medium text-green-600 dark:text-green-400">
                              Permanent access
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Indicator & Actions */}
                      <div className="flex flex-col items-end gap-1">
                        {days !== null && days >= 0 && days <= 7 && (
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            {days} {days === 1 ? 'day' : 'days'} left
                          </span>
                        )}
                        {days !== null && days < 0 && (
                          <span className="text-xs font-medium text-destructive">Expired</span>
                        )}
                        
                        {/* Remove button (only for non-owners and if user can manage) */}
                        {canManageRoles && roleAssignment.role !== 'owner' && (
                          <RemoveAccessDialog
                            roleId={roleAssignment.id}
                            propertyId={propertyId}
                            userName={roleAssignment.user?.full_name || 'Unknown User'}
                            userRole={roleAssignment.role}
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
              </div>
            </div>
          );
        })}

        {/* Footer Note */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Access permissions are automatically enforced. Only authorized roles can view restricted
            documents and information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
