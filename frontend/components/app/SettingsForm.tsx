import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SettingsFormProps = {
  defaultName?: string | null;
  defaultOrganisation?: string | null;
  defaultEmail?: string | null;
};

export function SettingsForm({ defaultName = '', defaultOrganisation = '', defaultEmail = '' }: SettingsFormProps) {
  return (
    <form className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" defaultValue={defaultName || ''} placeholder="Alex Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organisation">Organisation</Label>
          <Input
            id="organisation"
            name="organisation"
            defaultValue={defaultOrganisation || ''}
            placeholder="e.g., Acme Conveyancing"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" defaultValue={defaultEmail || ''} type="email" placeholder="you@example.com" />
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
        Profile updates coming soon. For now, contact an admin to change account details.
      </div>
      <div className="flex justify-end">
        <Button type="button" disabled>
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default SettingsForm;
