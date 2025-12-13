'use client';

import * as React from 'react';
import { Loader2, CheckCircle, KeyRound } from 'lucide-react';
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
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Update password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one
            </CardDescription>
          </div>
        </div>
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
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 rounded-lg border border-success/50 bg-success/10 p-3 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              Password updated successfully
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} data-testid="security-submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
