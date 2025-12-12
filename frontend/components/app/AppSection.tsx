import React from 'react';
import { cn } from '@/lib/utils';

type AppSectionProps = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  id?: string;
  dataTestId?: string;
};

export function AppSection({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
  id,
  dataTestId,
}: AppSectionProps) {
  return (
    <section
      id={id}
      data-testid={dataTestId}
      className={cn(
        'rounded-2xl border border-border/60 bg-card/80 shadow-sm shadow-glow-xs backdrop-blur transition hover:shadow-glow-sm',
        className
      )}
    >
      {(title || description || actions) && (
        <header className="flex flex-col gap-3 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="space-y-1">
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded ? 'p-4 sm:p-6' : '')}>{children}</div>
    </section>
  );
}

export default AppSection;
