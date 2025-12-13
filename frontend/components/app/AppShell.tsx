import Link from 'next/link';
import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { AppAvatar } from '@/components/app/AppAvatar';
import { Button } from '@/components/ui/button';
import { Toaster, ToastProvider } from '@/components/ui/use-toast';
import { getServerUser } from '@/lib/auth/server-user';
import { canViewDocumentsUI, canViewMediaUI, type DashboardRole } from '@/lib/roles/domain';
import type { IconName } from '@/components/ui/icon';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { AppShellSidebar, type AppShellNavItem } from './AppShellSidebar';
import { DevRoleBanner } from './DevRoleBanner';

type AppShellProps = {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
};

export async function AppShell({ children, title = 'Property Passport', actions }: AppShellProps) {
  const session = await getServerUser();
  const isAdmin = session?.isAdmin ?? false;
  const role: DashboardRole = isAdmin
    ? 'admin'
    : session && session.primary_role === 'agent'
    ? 'agent'
    : session && session.primary_role === 'conveyancer'
    ? 'conveyancer'
    : session && Object.values(session.property_roles || {}).some((r) => r.status.includes('owner'))
    ? 'owner'
    : 'buyer';

  const navItems: AppShellNavItem[] = [
    { href: '/dashboard', label: 'Dashboard', slug: 'dashboard', icon: 'home' as IconName },
    { href: '/properties', label: 'Properties', slug: 'properties', icon: 'properties' },
    { href: '/invitations', label: 'Invitations', slug: 'invitations', icon: 'invitations' },
    { href: '/tasks', label: 'Issues', slug: 'issues', icon: 'issues' },
    { href: '/watchlist', label: 'Watchlist', slug: 'watchlist', icon: 'watchlist' },
    { href: '/settings', label: 'Settings', slug: 'settings', icon: 'settings' },
  ];

  if (canViewDocumentsUI(role)) {
    navItems.splice(3, 0, { href: '/properties', label: 'Documents', slug: 'documents', icon: 'documents' });
  }

  if (canViewMediaUI(role)) {
    navItems.splice(4, 0, { href: '/properties', label: 'Media', slug: 'media', icon: 'media' });
  }

  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', slug: 'admin', icon: 'admin' });
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppShellSidebar items={navItems} />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="hidden flex-col sm:flex">
                <div className="text-base font-semibold text-primary">{title}</div>
                <span className="text-xs text-muted-foreground">Property Passport UK</span>
              </div>
              <div className="flex-1">
                <GlobalSearchBar />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {actions ?? (
                <Button asChild size="sm" data-testid="action-add-property">
                  <Link href="/properties/create">
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    Add property
                  </Link>
                </Button>
              )}
              <AppAvatar name={session?.full_name} email={session?.email ?? undefined} size="sm" />
            </div>
          </header>

          <AppShellSidebar items={navItems} variant="mobile" />

          <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
              {children}
              <DevRoleBanner
                userId={session?.id ?? null}
                role={session?.primary_role ?? null}
                propertyCount={Object.keys(session?.property_roles ?? {}).length}
              />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  );
}

export default AppShell;
