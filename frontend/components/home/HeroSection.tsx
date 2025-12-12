import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloatingCard, Section, Container } from './PageWrapper';

export function HeroSection() {
  return (
    <Section className="pb-6 pt-14 sm:pt-20" dataTestId="public-hero">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]" dataTestId="public-hero-container">
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <div className="hero-title-chip inline-flex items-center gap-3 rounded-full border border-primary/30 bg-gradient-to-r from-primary/10 via-accent/15 to-success/10 px-6 py-3 text-lg font-semibold text-primary shadow-lg shadow-primary/15">
              <span
                className="h-3 w-3 rounded-full bg-primary shadow-[0_0_0_6px_rgba(59,130,246,0.18)]"
                aria-hidden="true"
              />
              <span className="text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                The Digital Passport for UK Properties
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
              Make property transactions faster, safer, and transparent.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Property Passport UK centralizes verified evidence—ownership, EPC, searches, surveys—so every party can
              trust the data from day one. Cut completion times, reduce fall-throughs, and protect every transaction.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/auth/register">
              <Button size="lg" className="shadow-lg shadow-glow">
                Start a passport
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">
                View dashboard
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur sm:grid-cols-[1.2fr,1fr] sm:items-center">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-primary">Search your home address</div>
              <p className="text-sm text-muted-foreground">
                Prototype search UI. Wire to UPRN/OS Places when ready to prefill passport data.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative w-full">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    🔍
                  </span>
                  <Input className="pl-9" placeholder="Search your home address…" />
                </div>
                <Button className="w-full sm:w-auto">Search</Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 via-primary/5 to-success/10 blur-2xl" />
              <div className="relative grid gap-3">
                <FloatingCard title="KYC / AML" value="Verified" hint="Identity + ownership checks passed" />
                <FloatingCard title="Passport readiness" value="82%" hint="Docs validated, tasks tracked" className="ml-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative isolate">
          <div className="absolute -inset-8 rounded-[36px] bg-gradient-to-br from-primary/15 via-accent/10 to-success/10 blur-3xl" />
          <div className="relative rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-xl shadow-glow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Passport Preview</p>
                <p className="text-lg font-semibold text-primary">14B Wentworth Gardens</p>
              </div>
              <Badge className="bg-success/15 text-success">Ready to share</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FloatingCard title="EPC" value="B (83)" hint="Verified 2024-08" />
              <FloatingCard title="Ownership" value="Title verified" hint="Land Registry match" />
              <FloatingCard title="Searches" value="3 of 3" hint="Local, drainage, env." />
              <FloatingCard title="RLS access" value="Owner + Buyer + Agent" hint="Granular permissions" />
            </div>
            <div className="mt-6 rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-sm font-semibold text-primary">Timeline</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Passport created · Day 0
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  EPC, ID, Title verified · Day 4
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Buyer invited · Day 5
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  Searches returned · Day 9
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default HeroSection;
