import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container, Section } from './PageWrapper';

const personas = [
  { title: 'Owners & Sellers', desc: 'Prove your property is transaction-ready. Cut time-to-exchange dramatically.' },
  { title: 'Buyers', desc: 'See verified evidence early. Reduce surprises and protect your timeline.' },
  { title: 'Agents', desc: 'List properties with pre-verified packs. Win instructions and shorten pipelines.' },
  { title: 'Conveyancers', desc: 'Work from a single source of truth. Reduce rework and secure approvals faster.' },
];

export function Personas() {
  return (
    <Section className="bg-card/60">
      <Container className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Built for every stakeholder</h2>
          <p className="text-muted-foreground">Owners, buyers, agents, and conveyancers work from one source of truth.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {personas.map((p) => (
            <Card key={p.title} className="border-border/70">
              <CardHeader className="space-y-2">
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

export default Personas;
