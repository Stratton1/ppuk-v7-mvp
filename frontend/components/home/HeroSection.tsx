import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard, Section, Container } from './PageWrapper';

export function HeroSection() {
  return (
    <Section className="pb-8 pt-16 sm:pt-24" dataTestId="public-hero">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr,0.9fr]" dataTestId="public-hero-container">
        <div className="space-y-8 text-center lg:text-left">
          {/* Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground shadow-sm">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
              The Digital Passport for UK Properties
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Make property transactions faster, safer, and transparent.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Property Passport UK centralizes verified evidence—ownership, EPC, searches, surveys—so every party can
              trust the data from day one. Cut completion times, reduce fall-throughs, and protect every transaction.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/auth/register">
              <Button size="lg">Start a passport</Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline">
                Search properties
              </Button>
            </Link>
          </div>

          {/* Search Box */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">Search your home address</div>
              <p className="text-sm text-muted-foreground">
                Find your property or check if a passport already exists.
              </p>
              <form className="flex flex-col gap-3 sm:flex-row" action="/search" method="get">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="q" className="pl-9" placeholder="Enter postcode or address…" />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>
          </div>
        </div>

        {/* Passport Preview Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Passport Preview</p>
              <p className="mt-1 text-lg font-semibold text-foreground">14B Wentworth Gardens</p>
            </div>
            <Badge variant="success">Ready to share</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatCard title="EPC Rating" value="B (83)" hint="Verified Aug 2024" />
            <StatCard title="Ownership" value="Title verified" hint="Land Registry match" />
            <StatCard title="Searches" value="3 of 3" hint="Local, drainage, env." />
            <StatCard title="Access" value="3 stakeholders" hint="Owner, buyer, agent" />
          </div>
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Timeline</p>
            <div className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-success" />
                <span>Passport created · Day 0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                <span>EPC, ID, Title verified · Day 4</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span>Buyer invited · Day 5</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-warning" />
                <span>Searches returned · Day 9</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default HeroSection;
