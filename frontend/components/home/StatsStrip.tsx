import { Container, Section } from './PageWrapper';

const stats = [
  { label: 'Current UK average', value: '150–180 days', sub: 'Average property transaction time', variant: 'warning' as const },
  { label: 'With Property Passport', value: '21 days', sub: 'Pre-verified data ready on day one', variant: 'success' as const },
  { label: 'Failed sales yearly', value: '300,000+', sub: '1 in 3 collapse from missing data', variant: 'destructive' as const },
];

export function StatsStrip() {
  return (
    <Section className="py-6 bg-muted/30" dataTestId="public-stats-strip">
      <Container dataTestId="public-stats-strip-container">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className={`mt-2 text-2xl font-bold tabular-nums ${
                s.variant === 'success' ? 'text-success' :
                s.variant === 'warning' ? 'text-warning' :
                s.variant === 'destructive' ? 'text-destructive' :
                'text-foreground'
              }`}>
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default StatsStrip;
