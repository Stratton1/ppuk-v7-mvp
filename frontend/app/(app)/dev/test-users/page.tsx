'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

type TestUser = {
  label: string;
  email: string;
  password: string;
  testId: string;
  role: string;
  description: string;
};

const TEST_USERS: TestUser[] = [
  {
    label: 'Owner',
    email: 'owner@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-owner',
    role: 'consumer',
    description: 'Property owner with full edit access',
  },
  {
    label: 'Buyer',
    email: 'buyer@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-buyer',
    role: 'consumer',
    description: 'Prospective buyer with view access',
  },
  {
    label: 'Agent',
    email: 'agent@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-agent',
    role: 'agent',
    description: 'Estate agent managing properties',
  },
  {
    label: 'Conveyancer',
    email: 'conveyancer@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-conveyancer',
    role: 'conveyancer',
    description: 'Legal professional handling transactions',
  },
  {
    label: 'Tenant',
    email: 'tenant@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-tenant',
    role: 'consumer',
    description: 'Tenant with viewing permissions',
  },
  {
    label: 'Surveyor',
    email: 'surveyor@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-surveyor',
    role: 'surveyor',
    description: 'Surveyor handling inspections and uploads',
  },
  {
    label: 'Admin',
    email: 'admin@ppuk.test',
    password: 'password123',
    testId: 'dev-test-user-admin',
    role: 'admin',
    description: 'System administrator with full access',
  },
];

export default function DevTestUsersPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading test users…</div>}>
      <DevTestUsersContent />
    </Suspense>
  );
}

function DevTestUsersContent() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const allowed = useMemo(() => {
    const isDevMode = search.get('dev') === '1';
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
    const isPlaywright = process.env.PLAYWRIGHT_TEST === 'true';
    return isDevMode || isTestEnv || isPlaywright;
  }, [search]);

  useEffect(() => {
    if (!allowed) {
      router.replace('/dashboard');
      return;
    }

    // Check current user
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user?.email || null);
    });
  }, [allowed, router, supabase]);

  if (!allowed) {
    return null;
  }

  const handleLogin = async (user: TestUser) => {
    setLoggingIn(user.testId);
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });
    if (error) {
      console.error('Dev login failed', error.message);
      setLoggingIn(null);
      return;
    }
    setCurrentUser(user.email);
    setLoggingIn(null);
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <div className="space-y-6" data-testid="dev-test-users-root">
      <div className="rounded-lg border border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-950/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Development Mode Only
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          This page is only accessible in development or test environments.
        </p>
      </div>

      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current session</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{currentUser}</p>
              <p className="text-xs text-muted-foreground">Currently logged in</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test user accounts</CardTitle>
          <CardDescription>
            Quick login for testing different user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {TEST_USERS.map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                  {currentUser === user.email && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user.description}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {user.email} • {user.password}
                </p>
              </div>
              <Button
                data-testid={user.testId}
                onClick={() => handleLogin(user)}
                disabled={loggingIn === user.testId || currentUser === user.email}
                variant={currentUser === user.email ? 'outline' : 'default'}
                size="sm"
              >
                {loggingIn === user.testId
                  ? 'Signing in...'
                  : currentUser === user.email
                  ? 'Active'
                  : 'Sign in'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
