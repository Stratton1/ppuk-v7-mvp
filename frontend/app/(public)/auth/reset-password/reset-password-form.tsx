'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your new password. It must be at least 8 characters long.
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
              placeholder="••••••••"
              data-testid="reset-password-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              data-testid="reset-password-confirm"
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending} data-testid="reset-password-submit">
            {pending ? 'Resetting...' : 'Reset password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
