'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/types/forms';

type SecurityFormProps = {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

export function SecurityForm({ action }: SecurityFormProps) {
  const [state, formAction, isPending] = React.useActionState(action, {} as ActionResult);
  const [saved, setSaved] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Show saved message when state changes to success
  React.useEffect(() => {
    if (state?.success) {
      setSaved(true);
      formRef.current?.reset();
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update password</CardTitle>
        <CardDescription>
          Enter your current password and choose a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          className="space-y-6"
          action={formAction}
          data-testid="security-form"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                placeholder="••••••••"
                data-testid="security-current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                data-testid="security-new-password"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                data-testid="security-confirm-password"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          {saved && (
            <p className="text-sm text-green-600">Password updated successfully</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} data-testid="security-submit">
              {isPending ? 'Updating...' : 'Update password'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
