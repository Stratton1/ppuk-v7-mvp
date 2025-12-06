import { Button } from '@/components/ui/button';
import { AppAvatar } from '@/components/app/AppAvatar';
import type { Database } from '@/types/supabase';
import { StakeholderRoleBadge } from './stakeholder-role-badge';
import { StakeholderStatus } from './stakeholder-status';

type StakeholderRowProps = {
  stakeholder: {
    user_id: string;
    email?: string | null;
    full_name?: string | null;
    status?: Database['public']['Enums']['property_status_type'] | null;
    permission?: Database['public']['Enums']['property_permission_type'] | null;
    role?: string | null;
    invitation_status?: 'invited' | 'accepted' | null;
  };
};

export function StakeholderRow({ stakeholder }: StakeholderRowProps) {
  const name = stakeholder.full_name || stakeholder.email || 'Unknown user';
  const role = stakeholder.status ?? stakeholder.permission ?? stakeholder.role ?? null;
  const permLabel =
    stakeholder.permission === 'editor'
      ? 'Edit / upload'
      : stakeholder.permission === 'viewer'
      ? 'View only'
      : stakeholder.status === 'owner'
      ? 'Manage'
      : 'View';

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3">
      <div className="flex items-center gap-3">
        <AppAvatar name={name} email={stakeholder.email} size="sm" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StakeholderRoleBadge role={role} />
            <span>{permLabel}</span>
            <StakeholderStatus status={stakeholder.invitation_status ?? 'accepted'} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline">
          Resend
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          Remove
        </Button>
      </div>
    </div>
  );
}
