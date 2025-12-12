import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { StakeholderRow } from '@/components/property/stakeholders/stakeholder-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteDialog } from '@/components/property/stakeholders/invite-dialog';
import { getServerUser } from '@/lib/auth/server-user';
import { canInvite } from '@/lib/role-utils';

type StakeholderRowShape = {
  id: string;
  user_id: string;
  role: string | null;
  status: Database['public']['Enums']['property_status_type'] | null;
  permission: Database['public']['Enums']['property_permission_type'] | null;
  full_name?: string | null;
  email?: string | null;
  invitation_status?: 'invited' | 'accepted' | null;
  invitation_id?: string | null;
  kind: 'stakeholder';
};

type PropertyStakeholdersSectionProps = {
  propertyId: string;
};

export async function PropertyStakeholdersSection({ propertyId }: PropertyStakeholdersSectionProps) {
  const supabase = createServerClient();
  const user = await getServerUser();

  const { data: stakeholders } = await supabase
    .from('property_stakeholders')
    .select('user_id, role, status, permission, users(full_name, email)')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  type StakeholderWithUser = Database['public']['Tables']['property_stakeholders']['Row'] & {
    users: { full_name: string | null; email: string | null } | null;
  };

  const entries: StakeholderRowShape[] =
    stakeholders?.map((s) => {
      const casted = s as StakeholderWithUser;
      return {
        user_id: casted.user_id,
        role: casted.role,
        status: casted.status,
        permission: casted.permission,
        full_name: casted.users?.full_name ?? null,
        email: casted.users?.email ?? null,
        invitation_status: 'accepted',
        invitation_id: null,
        kind: 'stakeholder',
        id: casted.user_id,
      };
    }) ?? [];

  const canInviteStakeholders = canInvite(user, propertyId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Stakeholders</h3>
        <InviteDialog propertyId={propertyId} canInvite={canInviteStakeholders} />
      </div>
      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No stakeholders added yet. Invite collaborators to share this passport.
          </CardContent>
        </Card>
      ) : (
        entries.map((entry) => <StakeholderRow key={entry.id} stakeholder={entry} propertyId={propertyId} />)
      )}
    </div>
  );
}
