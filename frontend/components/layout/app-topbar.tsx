import Link from 'next/link';
import { GlobalSearch } from '@/components/layout/global-search';
import { AppAvatar } from '@/components/app/AppAvatar';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/auth/actions';
import { getServerUser } from '@/lib/auth/server-user';

export async function AppTopbar() {
  const session = await getServerUser();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4">
      <div className="hidden text-sm font-semibold text-muted-foreground sm:block">Property Passport</div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="hidden md:block">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary">
            Settings
          </Link>
          <form action={logoutAction}>
            <Button type="submit" size="sm" variant="outline">
              Logout
            </Button>
          </form>
          <AppAvatar name={session?.full_name} email={session?.email ?? undefined} size="sm" />
        </div>
      </div>
    </header>
  );
}
