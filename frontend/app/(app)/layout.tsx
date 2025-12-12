import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { AppShell } from '@/components/app/AppShell';
import { getSessionOrRedirect } from '@/lib/auth/server-user';

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Enforce authentication for all protected app routes
  const hdrs = await headers();
  const currentPath = hdrs.get('x-pathname') ?? hdrs.get('next-url') ?? '/dashboard';
  await getSessionOrRedirect({ redirectTo: currentPath ?? '/dashboard' });
  return <AppShell>{children}</AppShell>;
}
