import { FileX, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const painPoints = [
  {
    title: 'Fragmented evidence',
    desc: 'Title, EPC, insurance, surveys, searches—scattered across email, portals, and filing cabinets.',
    icon: FileX,
  },
  {
    title: 'Slow due diligence',
    desc: 'Manual chasing creates 150–180 day completions and rising fall-throughs.',
    icon: Clock,
  },
  {
    title: 'Low trust',
    desc: 'No shared source of truth; every party rechecks the same documents.',
    icon: ShieldAlert,
  },
];

export function WhyUKNeedsPassports() {
  return (
    <Section dataTestId="public-why-passports">
      <Container className="space-y-8" dataTestId="public-why-passports-container">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Why the UK needs property passports</h2>
          <p className="text-muted-foreground">
            The UK is the slowest major market: 150–180 days to complete, with 1 in 3 sales collapsing (~300k failures
            yearly). Causes: late documentation, missing data, and siloed systems.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {painPoints.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="border-border">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <CardDescription>{p.desc}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export default WhyUKNeedsPassports;
