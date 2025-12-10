import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Crumb = { label: string; href?: string };

type AppPageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
};

export function AppPageHeader({ title, description, breadcrumbs, actions, className }: AppPageHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background/60 to-accent/5 p-6 shadow-sm shadow-glow-xs backdrop-blur',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && <span aria-hidden className="text-border">/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-tight text-primary sm:text-4xl">{title}</h1>
            {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default AppPageHeader;
