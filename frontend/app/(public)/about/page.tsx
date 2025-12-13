import Link from 'next/link';
import { Shield, Clock, Users, FileCheck, Building2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const values = [
  {
    title: 'Trust & Transparency',
    description: 'Every document is verified, every action is logged. No hidden information, no surprises.',
    icon: Shield,
  },
  {
    title: 'Speed & Efficiency',
    description: 'Pre-verified data means faster completions. What takes 150 days can happen in 21.',
    icon: Clock,
  },
  {
    title: 'Collaboration',
    description: 'Owners, buyers, agents, and conveyancers work from the same source of truth.',
    icon: Users,
  },
];

const features = [
  {
    title: 'UPRN-Anchored Data',
    description: 'Every passport is linked to a unique property reference number for accuracy.',
    icon: Building2,
  },
  {
    title: 'Verified Documents',
    description: 'Title deeds, EPCs, surveys, and searches — all verified and timestamped.',
    icon: FileCheck,
  },
  {
    title: 'Granular Permissions',
    description: 'Control who sees what with role-based access and audit trails.',
    icon: Scale,
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          About Property Passport UK
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          We're building the infrastructure for faster, safer, and more transparent property transactions in the UK.
        </p>
      </section>

      {/* Mission */}
      <section className="rounded-xl border border-border bg-card p-8 md:p-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            The UK property market is broken. Transactions take 150–180 days on average, and 1 in 3 sales fall through
            due to missing documentation, late surprises, and siloed information. Property Passport UK exists to fix this.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By creating a single, verified digital passport for every property, we enable all parties — owners, buyers,
            agents, conveyancers, and surveyors — to work from the same trusted source of truth. No more chasing documents.
            No more duplicate verification. Just faster, safer transactions.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">Our Values</h2>
          <p className="mt-2 text-muted-foreground">The principles that guide everything we build.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title} className="border-border">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">What We Provide</h2>
          <p className="mt-2 text-muted-foreground">The building blocks of a modern property transaction.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-border bg-muted/30 p-8 md:p-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Security & Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Property data is sensitive. That's why we've built security into every layer of our platform.
            Row-level security ensures you only see what you're authorised to see. All documents are stored
            with encryption. Every action is logged in an immutable audit trail. And granular permissions
            mean property owners always control who has access.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
        <p className="mt-2 text-muted-foreground">
          Create your property passport today and join the future of UK property transactions.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/auth/register">
            <Button size="lg">Create a passport</Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline">
              Search properties
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="ghost">
              Contact us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
