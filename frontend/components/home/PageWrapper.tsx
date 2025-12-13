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

/** Clean stat card for landing page - no glows or gradients */
export const StatCard = ({
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
  <div className={`rounded-lg border border-border bg-muted/30 p-3 ${className}`}>
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
    <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{hint}</p>
  </div>
);

/** @deprecated Use StatCard instead */
export const FloatingCard = StatCard;

export const Dot = () => <span className="mx-2 text-muted-foreground">·</span>;

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="bg-background">{children}</div>;
}

export default PageWrapper;
