import { LayoutDashboard, Users, Eye, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard, Container, Section } from './PageWrapper';

export function ProductPreview() {
  return (
    <Section dataTestId="public-product-preview">
      <Container className="space-y-8" dataTestId="public-product-preview-container">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Product preview</h2>
          <p className="text-muted-foreground">
            A glimpse of the dashboard, access controls, and verification status tracking.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            {/* Dashboard Preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Dashboard</p>
                </div>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <StatCard title="Tasks open" value="12" hint="Track completion" />
                <StatCard title="Documents" value="31" hint="Verified & stored" />
                <StatCard title="Media" value="48" hint="Photos & videos" />
                <StatCard title="Stakeholders" value="8" hint="With access" />
              </div>
            </div>
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Access roles</p>
                  <p className="text-sm text-muted-foreground">Owner, Buyer, Agent — granular and revocable</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Public visibility</p>
                  <p className="text-sm text-muted-foreground">Control what's public via shareable links</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Audit trail</p>
                  <p className="text-sm text-muted-foreground">Every action logged with timestamps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default ProductPreview;
