'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { sendPropertyInvitationAction } from '@/actions/property-invitations';
import { useRouter } from 'next/navigation';

type InviteDialogProps = {
  propertyId: string;
};

export function InviteDialog({ propertyId }: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '').trim();
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter an email.', variant: 'destructive' });
      return;
    }

    startTransition(async () => {
      const result = await sendPropertyInvitationAction({
        propertyId,
        inviteeEmail: email,
        permission,
      });
      if (!result.success) {
        toast({ title: 'Failed to send invite', description: result.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Invitation sent', description: `${email} has been invited.` });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid="invite-button">
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite stakeholder</DialogTitle>
          <DialogDescription>Send an invitation to collaborate on this property passport.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="name@example.com" data-testid="invite-email" />
          </div>
          <div className="space-y-2">
            <Label>Permission</Label>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="permission"
                  value="viewer"
                  checked={permission === 'viewer'}
                  onChange={() => setPermission('viewer')}
                />
                Viewer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="permission"
                  value="editor"
                  checked={permission === 'editor'}
                  onChange={() => setPermission('editor')}
                />
                Editor
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} data-testid="invite-submit">
              {isPending ? 'Sending…' : 'Send invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
