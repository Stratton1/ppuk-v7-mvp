'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { KeyRound, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/types/forms';

type ResetPasswordFormProps = {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

export function ResetPasswordForm({ action }: ResetPasswordFormProps) {
  const [state, formAction] = React.useActionState(action, {} as ActionResult);
  const { pending } = useFormStatus();

  return (
    <Card className="w-full max-w-md border-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction} data-testid="reset-password-form">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Enter new password"
              data-testid="reset-password-password"
            />
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Confirm new password"
              data-testid="reset-password-confirm"
            />
          </div>
          {state?.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={pending} data-testid="reset-password-submit">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Reset password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
