import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const steps = [
  { title: 'Create a passport', desc: 'Anchor data to the UPRN. Add ownership, EPC, searches, surveys, and ID.' },
  { title: 'Verify once', desc: 'Professionals verify documents; statuses and signatures are stored immutably.' },
  { title: 'Share with control', desc: 'Grant buyer/agent/conveyancer access with RLS-backed permissions.' },
  { title: 'Complete faster', desc: 'Everyone works from the same live passport—no duplicate chasing.' },
];

export function HowItWorks() {
  return (
    <Section>
      <Container className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">How it works</h2>
          <p className="text-muted-foreground">Four steps to a transaction-ready passport.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, idx) => (
            <Card key={step.title} className="border-border/70">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  Step {idx + 1}
                </Badge>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default HowItWorks;
