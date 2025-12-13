import { Home, ShoppingCart, Building2, Scale } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const personas = [
  {
    title: 'Owners & Sellers',
    desc: 'Prove your property is transaction-ready. Cut time-to-exchange dramatically.',
    icon: Home,
  },
  {
    title: 'Buyers',
    desc: 'See verified evidence early. Reduce surprises and protect your timeline.',
    icon: ShoppingCart,
  },
  {
    title: 'Agents',
    desc: 'List properties with pre-verified packs. Win instructions and shorten pipelines.',
    icon: Building2,
  },
  {
    title: 'Conveyancers',
    desc: 'Work from a single source of truth. Reduce rework and secure approvals faster.',
    icon: Scale,
  },
];

export function Personas() {
  return (
    <Section className="bg-muted/30" dataTestId="public-personas">
      <Container className="space-y-8" dataTestId="public-personas-container">
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Built for every stakeholder</h2>
          <p className="text-muted-foreground">Owners, buyers, agents, and conveyancers work from one source of truth.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="border-border">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{p.title}</CardTitle>
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

export default Personas;
