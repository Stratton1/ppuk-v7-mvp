import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dot, Container, Section } from './PageWrapper';

export function BeforeAfter() {
  return (
    <Section className="bg-gradient-to-br from-primary/5 via-background to-accent/5" dataTestId="public-before-after">
      <Container className="space-y-6" dataTestId="public-before-after-container">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Before vs. After Property Passport</h2>
          <p className="text-muted-foreground">See how workflows compress when evidence is ready on day one.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <span>Before</span>
                <Dot />
                <span className="text-sm text-muted-foreground">150–180 days</span>
              </CardTitle>
              <CardDescription>Manual chasing, duplicate checks, late surprises.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-4">
                <li>Evidence scattered across email, portals, and PDFs.</li>
                <li>Every professional revalidates the same documents.</li>
                <li>Buyers commit late; 1 in 3 deals collapse.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-success/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <span>After</span>
                <Dot />
                <span className="text-sm text-muted-foreground">21 days possible</span>
              </CardTitle>
              <CardDescription>Pre-verified passport, shared with granular permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <ul className="list-disc space-y-1 pl-4">
                <li>UPRN-anchored passport holds ownership, EPC, searches, surveys.</li>
                <li>Verification status and history visible to all parties.</li>
                <li>RLS controls: owner, buyer, agent, conveyancer with audit trails.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

export default BeforeAfter;
