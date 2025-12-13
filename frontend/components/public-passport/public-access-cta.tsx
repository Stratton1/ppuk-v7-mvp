import Link from 'next/link';
import { Lock, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PublicAccessCtaProps = {
  propertyId: string;
  isLoggedIn: boolean;
};

export const PublicAccessCta = ({ propertyId, isLoggedIn }: PublicAccessCtaProps) => {
  return (
    <section className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Need full access?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is a public view with limited information. Full property passports include verified documents,
              complete history, issues, and more. Request access from the property owner to see everything.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isLoggedIn ? (
              <Link href={`/properties/${propertyId}`}>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Request access
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
