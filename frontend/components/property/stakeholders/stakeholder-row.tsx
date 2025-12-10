 'use client';

import { Button } from '@/components/ui/button';
import { AppAvatar } from '@/components/app/AppAvatar';
import type { Database } from '@/types/supabase';
import { StakeholderRoleBadge } from './stakeholder-role-badge';
import { StakeholderStatus } from './stakeholder-status';
import { useTransition } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { removeStakeholderAction, resendInvitationAction } from '@/actions/property-invitations';

type StakeholderRowProps = {
  stakeholder: {
    id: string;
    user_id?: string | null;
    email?: string | null;
    full_name?: string | null;
    status?: Database['public']['Enums']['property_status_type'] | null;
    permission?: Database['public']['Enums']['property_permission_type'] | null;
    role?: string | null;
    invitation_status?: 'invited' | 'accepted' | null;
    invitation_id?: string | null;
    kind: 'stakeholder' | 'invitation';
  };
  propertyId: string;
};

export function StakeholderRow({ stakeholder, propertyId }: StakeholderRowProps) {
  const name = stakeholder.full_name || stakeholder.email || 'Unknown user';
  const role = stakeholder.role ?? stakeholder.permission ?? stakeholder.status ?? null;
  const permLabel =
    stakeholder.permission === 'editor'
      ? 'Edit / upload'
      : stakeholder.permission === 'viewer'
      ? 'View only'
      : stakeholder.status === 'owner'
      ? 'Manage'
      : 'View';

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleResend = () => {
    if (!stakeholder.invitation_id) return;
    startTransition(async () => {
      const result = await resendInvitationAction(stakeholder.invitation_id!);
      if (!result.success) {
        toast({ title: 'Failed to resend', description: result.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Invitation resent', description: 'Invite re-sent to user.' });
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeStakeholderAction(stakeholder.user_id ?? stakeholder.id, propertyId);
      if (!result.success) {
        toast({ title: 'Failed to remove', description: result.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Removed', description: 'Stakeholder removed.' });
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3" data-testid="invite-row">
      <div className="flex items-center gap-3">
        <AppAvatar name={name} email={stakeholder.email} size="sm" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StakeholderRoleBadge role={role} />
            {stakeholder.permission && <span>{permLabel}</span>}
            <StakeholderStatus status={stakeholder.invitation_status ?? 'accepted'} />
          </div>
        </div>
      </div>
      {stakeholder.kind === 'invitation' ? (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleResend} disabled={isPending}>
            Resend
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleRemove}
            disabled={isPending}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
