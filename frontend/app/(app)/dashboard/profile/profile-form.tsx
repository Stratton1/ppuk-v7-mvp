'use client';

import * as React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { ActionResult } from '@/types/forms';

type ProfileFormProps = {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  initialData: {
    email: string;
    fullName: string;
    avatarUrl: string;
    organisation: string;
    phone: string;
    bio: string;
    primaryRole: string;
  };
};

export function ProfileForm({ action, initialData }: ProfileFormProps) {
  const [state, formAction, isPending] = React.useActionState(action, {} as ActionResult);
  const [saved, setSaved] = React.useState(false);

  // Show saved message when state changes to success
  React.useEffect(() => {
    if (state?.success) {
      setSaved(true);
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="space-y-6" action={formAction} data-testid="profile-form">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData.email}
                disabled
                className="bg-muted"
                data-testid="profile-email"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryRole">Role</Label>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="secondary" className="capitalize">
                  {initialData.primaryRole}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Contact support to change your role
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={initialData.fullName}
                placeholder="John Smith"
                data-testid="profile-fullname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organisation">Organisation</Label>
              <Input
                id="organisation"
                name="organisation"
                type="text"
                defaultValue={initialData.organisation}
                placeholder="Acme Properties Ltd"
                data-testid="profile-organisation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initialData.phone}
                placeholder="+44 7700 900000"
                data-testid="profile-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                defaultValue={initialData.avatarUrl}
                placeholder="https://example.com/avatar.jpg"
                data-testid="profile-avatar"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={initialData.bio}
              placeholder="Tell us a bit about yourself..."
              data-testid="profile-bio"
            />
          </div>

          {state?.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-success/50 bg-success/10 p-3 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              Profile saved successfully
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} data-testid="profile-submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
