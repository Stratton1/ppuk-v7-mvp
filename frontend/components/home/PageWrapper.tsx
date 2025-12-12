import React from 'react';

export function Container({
  children,
  className = '',
  dataTestId,
}: {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  className = '',
  dataTestId,
}: {
  children: React.ReactNode;
  className?: string;
  dataTestId?: string;
}) {
  return (
    <section className={`py-12 sm:py-16 ${className}`} data-testid={dataTestId}>
      {children}
    </section>
  );
}

export const GradientBlob = ({ className = '' }: { className?: string }) => (
  <div className={`pointer-events-none absolute inset-0 opacity-60 blur-3xl ${className}`} aria-hidden>
    <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-primary/30 via-accent/40 to-primary/20" />
    <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-success/20 via-accent/20 to-primary/20" />
  </div>
);

export const FloatingCard = ({
  title,
  value,
  hint,
  className = '',
}: {
  title: string;
  value: string;
  hint: string;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-border/60 bg-card/80 p-4 shadow-lg shadow-glow-sm backdrop-blur ${className}`}
  >
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
    <p className="text-xs text-muted-foreground">{hint}</p>
  </div>
);

export const Dot = () => <span className="mx-2 text-muted-foreground">•</span>;

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <GradientBlob />
      {children}
    </div>
  );
}

export default PageWrapper;
