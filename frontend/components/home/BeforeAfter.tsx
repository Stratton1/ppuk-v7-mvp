import { XCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

export function BeforeAfter() {
  return (
    <Section className="bg-muted/30" dataTestId="public-before-after">
      <Container className="space-y-6" dataTestId="public-before-after-container">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Before vs. After Property Passport</h2>
          <p className="text-muted-foreground">See how workflows compress when evidence is ready on day one.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-destructive/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-destructive">Before</CardTitle>
                  <p className="text-sm text-muted-foreground">150–180 days average</p>
                </div>
              </div>
              <CardDescription className="pt-2">Manual chasing, duplicate checks, late surprises.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive/60" />
                  Evidence scattered across email, portals, and PDFs.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive/60" />
                  Every professional revalidates the same documents.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive/60" />
                  Buyers commit late; 1 in 3 deals collapse.
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-success/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-success">After</CardTitle>
                  <p className="text-sm text-muted-foreground">21 days possible</p>
                </div>
              </div>
              <CardDescription className="pt-2">Pre-verified passport, shared with granular permissions.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success/60" />
                  UPRN-anchored passport holds ownership, EPC, searches, surveys.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success/60" />
                  Verification status and history visible to all parties.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success/60" />
                  Granular access controls with full audit trails.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

export default BeforeAfter;
