 'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { updateProfileAction } from '@/actions/update-profile';

type SettingsFormProps = {
  defaultName?: string | null;
  defaultOrganisation?: string | null;
  defaultEmail?: string | null;
  defaultPrimaryRole?: string | null;
};

const ROLE_OPTIONS = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'agent', label: 'Agent' },
  { value: 'conveyancer', label: 'Conveyancer' },
  { value: 'surveyor', label: 'Surveyor' },
  { value: 'admin', label: 'Admin' },
];

export function SettingsForm({
  defaultName = '',
  defaultOrganisation = '',
  defaultEmail = '',
  defaultPrimaryRole = 'consumer',
}: SettingsFormProps) {
  const [fullName, setFullName] = useState(defaultName || '');
  const [organisation, setOrganisation] = useState(defaultOrganisation || '');
  const [primaryRole, setPrimaryRole] = useState(defaultPrimaryRole || 'consumer');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction({
        full_name: fullName,
        organisation: organisation || null,
        primary_role: primaryRole,
      });
      if (!result.success) {
        setError(result.error || 'Failed to update profile');
        toast({ title: 'Failed to update profile', description: result.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    });
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Doe"
            data-testid="settings-full-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organisation">Organisation</Label>
          <Input
            id="organisation"
            name="organisation"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
            placeholder="e.g., Acme Conveyancing"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" value={defaultEmail || ''} type="email" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Primary role</Label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={primaryRole}
            onChange={(e) => setPrimaryRole(e.target.value)}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} data-testid="settings-save">
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export default SettingsForm;
