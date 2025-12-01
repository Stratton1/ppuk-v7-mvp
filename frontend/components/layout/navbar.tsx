import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from './global-search';

export const Navbar = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = !!user;

  return (
    <header className="border-b bg-card text-card-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex-shrink-0 text-lg font-semibold text-primary">
          Property Passport UK
        </Link>

        <div className="hidden max-w-xl flex-1 justify-center md:flex">
          <GlobalSearch />
        </div>

        <nav className="flex flex-shrink-0 items-center gap-4 text-sm font-medium">
          {isAuthed && (
            <Link href="/dashboard" className="text-foreground hover:text-primary">
              Dashboard
            </Link>
          )}
          <Link href="/properties" className="text-foreground hover:text-primary">
            {isAuthed ? 'My Properties' : 'Properties'}
          </Link>
          {!isAuthed ? (
            <>
              <Link href="/auth/login" className="text-foreground hover:text-primary">
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          ) : (
            <Link href="/auth/logout" className="text-foreground hover:text-primary">
              Logout
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
