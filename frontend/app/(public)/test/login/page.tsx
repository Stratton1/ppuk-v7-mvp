 'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

type TestUser = {
  label: string;
  email: string;
  password: string;
  testId: string;
};

const TEST_USERS: TestUser[] = [
  { label: 'Owner', email: 'owner@ppuk.test', password: 'password123', testId: 'test-login-owner' },
  { label: 'Buyer', email: 'buyer@ppuk.test', password: 'password123', testId: 'test-login-buyer' },
  { label: 'Tenant', email: 'tenant@ppuk.test', password: 'password123', testId: 'test-login-tenant' },
  { label: 'Agent', email: 'agent@ppuk.test', password: 'password123', testId: 'test-login-agent' },
  {
    label: 'Conveyancer',
    email: 'conveyancer@ppuk.test',
    password: 'password123',
    testId: 'test-login-conveyancer',
  },
  { label: 'Surveyor', email: 'surveyor@ppuk.test', password: 'password123', testId: 'test-login-surveyor' },
  { label: 'Admin', email: 'admin@ppuk.test', password: 'password123', testId: 'test-login-admin' },
];

export default function TestLoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading test login…</div>}>
      <TestLoginContent />
    </Suspense>
  );
}

function TestLoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  const allowed = useMemo(() => {
    const isQuery = search.get('testmode') === '1';
    const isTestEnv = process.env.NODE_ENV === 'test';
    const isPlaywright = process.env.PLAYWRIGHT_TEST === 'true';
    return isQuery || isTestEnv || isPlaywright;
  }, [search]);

  useEffect(() => {
    if (!allowed) {
      router.replace('/');
    }
  }, [allowed, router]);

  if (!allowed) {
    return null;
  }

  const handleLogin = async (user: TestUser) => {
    setLoggingIn(user.testId);
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: user.password });
    if (error) {
      console.error('Test login failed', error.message);
      setLoggingIn(null);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4" data-testid="test-login-root">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Test Login Panel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {TEST_USERS.map((user) => (
            <Button
              key={user.email}
              data-testid={user.testId}
              onClick={() => handleLogin(user)}
              disabled={loggingIn === user.testId}
            >
              {loggingIn === user.testId ? 'Signing in…' : `Log in as ${user.label}`}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
