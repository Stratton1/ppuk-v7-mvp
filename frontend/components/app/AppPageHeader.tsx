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

export function AppPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: AppPageHeaderProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && (
                    <span aria-hidden className="text-border">
                      /
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export default AppPageHeader;
