import { Container, Section } from './PageWrapper';

const stats = [
  { label: 'UK completions today', value: '150–180 days', sub: 'Current average transaction time' },
  { label: 'With a property passport', value: '21 days possible', sub: 'Pre-verified data, ready on day one' },
  { label: 'Failed sales each year', value: '300k+', sub: '1 in 3 collapse from missing or late data' },
];

export function StatsStrip() {
  return (
    <Section className="py-8">
      <Container>
        <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-background/70 p-4 shadow-xs">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{s.value}</p>
              {s.sub && <p className="text-sm text-muted-foreground">{s.sub}</p>}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default StatsStrip;
