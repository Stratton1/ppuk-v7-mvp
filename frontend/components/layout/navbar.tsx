import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from './global-search';
import { AppAvatar } from '@/components/app/AppAvatar';

export const Navbar = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = !!user;

  return (
    <header className="border-b border-border/60 bg-card/80 text-card-foreground backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/70 via-accent/70 to-primary shadow-glow-xs" />
          <span>Property Passport UK</span>
        </Link>

        <div className="hidden max-w-xl flex-1 justify-center md:flex">
          <GlobalSearch />
        </div>

        <nav className="flex flex-shrink-0 items-center gap-3 text-sm font-medium">
          {isAuthed && (
            <Link href="/dashboard" className="text-foreground transition hover:text-primary">
              Dashboard
            </Link>
          )}
          <Link href="/properties" className="text-foreground transition hover:text-primary">
            {isAuthed ? 'My Properties' : 'Properties'}
          </Link>
          {!isAuthed ? (
            <>
              <Link href="/auth/login" className="text-foreground transition hover:text-primary">
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/logout" className="text-foreground transition hover:text-primary">
                Logout
              </Link>
              <AppAvatar email={user?.email} name={user?.user_metadata?.full_name} size="sm" />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
