'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/types/forms';

type ForgotPasswordFormProps = {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

export function ForgotPasswordForm({ action }: ForgotPasswordFormProps) {
  const [state, formAction] = React.useActionState(action, {} as ActionResult);
  const [submitted, setSubmitted] = React.useState(false);
  const { pending } = useFormStatus();
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (state?.error) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  }, [state]);

  if (submitted && !state?.error) {
    return (
      <Card className="w-full max-w-md" data-testid="forgot-password-success">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists with that email, we&apos;ve sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The link will expire in 24 hours. If you don&apos;t see the email, check your spam folder.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction} data-testid="forgot-password-form">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@ppuk.test"
              data-testid="forgot-password-email"
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending} data-testid="forgot-password-submit">
            {pending ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
