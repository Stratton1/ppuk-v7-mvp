import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dot, Container, Section } from './PageWrapper';

export function CTASection() {
  return (
    <Section className="pb-14">
      <Container className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-primary">Property Passport UK</p>
            <p className="text-sm text-muted-foreground">
              The digital passport for UK properties. Faster, safer, transparent transactions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register">
              <Button>Start now</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Secure by design</span>
          <Dot />
          <span>RLS + Signed URLs</span>
          <Dot />
          <span>UPRN anchored</span>
        </div>
      </Container>
    </Section>
  );
}

export default CTASection;
