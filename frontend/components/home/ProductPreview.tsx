import { Badge } from '@/components/ui/badge';
import { FloatingCard, Container, Section } from './PageWrapper';

export function ProductPreview() {
  return (
    <Section>
      <Container className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Product preview</h2>
          <p className="text-muted-foreground">
            Floating UI mockups showing the dashboard, access controls, and verification status cards.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 shadow-xl">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">Dashboard</p>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FloatingCard title="Tasks open" value="12" hint="RLS + timelines" />
                <FloatingCard title="Documents verified" value="31" hint="Signed URLs" />
                <FloatingCard title="Media uploaded" value="48" hint="Storage buckets" />
                <FloatingCard title="Invitations" value="8" hint="Owners, buyers, agents" />
              </div>
            </div>
            <div className="space-y-3">
              <FloatingCard title="Access roles" value="Owner · Buyer · Agent" hint="Granular, revocable" />
              <FloatingCard title="Public visibility" value="Controlled" hint="Toggle /p/[slug] sharing" />
              <FloatingCard title="Audit trail" value="Every action" hint="Events and RLS policies" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default ProductPreview;
