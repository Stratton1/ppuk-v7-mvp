'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export const ProtectedRoute = ({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) => {
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange> | null = null;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setHasSession(false);
      } else {
        setHasSession(!!data.session);
      }
      setLoading(false);
    });

    subscription = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setHasSession(!!session);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [supabase, redirectTo, router]);

  useEffect(() => {
    if (!loading && !hasSession) {
      router.replace(redirectTo);
    }
  }, [loading, hasSession, redirectTo, router]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Checking authentication…</div>;
  }

  if (!hasSession) {
    return null;
  }

  return <>{children}</>;
};
