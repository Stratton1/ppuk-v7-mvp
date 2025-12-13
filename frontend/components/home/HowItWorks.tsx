import { FilePlus, BadgeCheck, Share2, Rocket } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const steps = [
  {
    title: 'Create a passport',
    desc: 'Anchor data to the UPRN. Add ownership, EPC, searches, surveys, and ID.',
    icon: FilePlus,
  },
  {
    title: 'Verify once',
    desc: 'Professionals verify documents; statuses and signatures are stored immutably.',
    icon: BadgeCheck,
  },
  {
    title: 'Share with control',
    desc: 'Grant buyer/agent/conveyancer access with granular, revocable permissions.',
    icon: Share2,
  },
  {
    title: 'Complete faster',
    desc: 'Everyone works from the same live passport—no duplicate chasing.',
    icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <Section dataTestId="public-how-it-works">
      <Container className="space-y-8" dataTestId="public-how-it-works-container">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">How it works</h2>
          <p className="text-muted-foreground">Four steps to a transaction-ready passport.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="border-border">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription>{step.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export default HowItWorks;
