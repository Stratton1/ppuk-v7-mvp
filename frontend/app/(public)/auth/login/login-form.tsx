'use client';

/* eslint-disable ppuk/no-sync-dynamic-api */

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/types/forms';

type LoginFormProps = {
  action: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
};

export function LoginForm({ action }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [state, formAction] = React.useActionState(action, {} as ActionResult);
  const { pending } = useFormStatus();

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'login-form.tsx:mount',
        message: 'Login form mounted',
        data: {
          hasEnvUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          hasEnvAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          redirectTo,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [redirectTo]);
  // #endregion agent log

  const handleSubmit = React.useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H2',
        location: 'login-form.tsx:submit',
        message: 'Login form submitted',
        data: {
          pending,
          redirectTo,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
  }, [pending, redirectTo]);

  return (
    <Card className="w-full max-w-md border-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction} data-testid="login-form" onSubmit={handleSubmit}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              data-testid="login-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              data-testid="login-password"
            />
          </div>
          {state?.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={pending} data-testid="login-submit">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
