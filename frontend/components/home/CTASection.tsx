import Link from 'next/link';
import { Shield, Lock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container, Section } from './PageWrapper';

export function CTASection() {
  return (
    <Section className="pb-16" dataTestId="public-cta">
      <Container dataTestId="public-cta-container">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
              <p className="text-muted-foreground">
                Create your property passport today and streamline your transaction.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register">
                <Button size="lg">Create a passport</Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline">
                  Search properties
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-border pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure by design</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Row-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>UPRN anchored</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default CTASection;
