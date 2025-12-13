import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Invitation = {
  email: string;
  role: string;
  status: string;
  sentAt?: string | null;
  expiresAt?: string | null;
};

type InvitationsListProps = {
  invitations: Invitation[];
  emptyMessage?: string;
};

export function InvitationsList({ invitations, emptyMessage = 'No invitations found.' }: InvitationsListProps) {
  if (!invitations.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invite, idx) => (
        <div
          key={`${invite.email}-${idx}`}
          className={cn(
            'flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-sm',
            'sm:flex-row sm:items-center sm:justify-between'
          )}
        >
          <div className="space-y-1">
            <p className="font-medium">{invite.email}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {invite.role}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {invite.status}
              </Badge>
              {invite.sentAt && <span>Sent {invite.sentAt}</span>}
              {invite.expiresAt && <span>Expires {invite.expiresAt}</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {invite.status === 'pending' && <span className="text-warning">Awaiting accept</span>}
            {invite.status === 'expired' && <span className="text-destructive">Expired</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default InvitationsList;
