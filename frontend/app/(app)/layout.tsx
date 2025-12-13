import { type ReactNode } from 'react';
import { AppShell } from '@/components/app/AppShell';

/**
 * App Layout for authenticated routes.
 *
 * IMPORTANT: Authentication is enforced by middleware (proxy.ts) BEFORE
 * this layout renders. Do NOT add auth checks, cookies(), or headers()
 * here - the middleware is the single source of truth for auth.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
