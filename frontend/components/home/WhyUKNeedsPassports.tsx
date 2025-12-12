import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const painPoints = [
  { title: 'Fragmented evidence', desc: 'Title, EPC, insurance, surveys, searches—scattered across silos.' },
  { title: 'Slow due diligence', desc: 'Manual chasing creates 150–180 day completions and rising fall-throughs.' },
  { title: 'Low trust', desc: 'No shared source of truth; every party rechecks the same documents.' },
];

export function WhyUKNeedsPassports() {
  return (
    <Section dataTestId="public-why-passports">
      <Container className="space-y-8" dataTestId="public-why-passports-container">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Why the UK needs property passports</h2>
          <p className="text-muted-foreground">
            The UK is the slowest major market: 150–180 days to complete, with 1 in 3 sales collapsing (~300k failures
            yearly). Causes: late documentation, missing data, and siloed systems.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {painPoints.map((p) => (
            <Card key={p.title} className="border-border/70">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-full bg-accent/10 text-center text-xl leading-10">★</div>
                <CardTitle className="text-lg">{p.title}</CardTitle>
                <CardDescription>{p.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default WhyUKNeedsPassports;
