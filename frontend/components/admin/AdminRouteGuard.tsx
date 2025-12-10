/**
 * File: AdminRouteGuard.tsx
 * Purpose: Route guard component to protect admin routes
 */

import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server-user';
import { isAdmin } from '@/lib/role-utils';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export async function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/auth/login?redirect=/admin');
  }

  if (!isAdmin(user)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}

