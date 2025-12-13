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
        'rounded-xl border border-border bg-card',
        className
      )}
    >
      {(title || description || actions) && (
        <header className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
          <div className="space-y-0.5">
            {title && (
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </header>
      )}
      <div className={cn(padded ? 'p-4 sm:p-5' : '')}>{children}</div>
    </section>
  );
}

export default AppSection;
