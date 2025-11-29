'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSupabase } from '@/providers/supabase-provider';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export const ProtectedRoute = ({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) => {
  const router = useRouter();
  const { session, loading } = useSupabase();

  useEffect(() => {
    if (!loading && !session) {
      router.replace(redirectTo);
    }
  }, [loading, session, redirectTo, router]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Checking authentication…</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
};
