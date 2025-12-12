'use client';

'use client';

/* eslint-disable ppuk/no-sync-dynamic-api */

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your dashboard with Supabase-backed authentication.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction} data-testid="login-form" onSubmit={handleSubmit}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@ppuk.test"
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
              placeholder="••••••••"
              data-testid="login-password"
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending} data-testid="login-submit">
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
