import React from 'react';
import { cn } from '@/lib/utils';

type AppKPIProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
};

export function AppKPI({ label, value, hint, icon, trend, className }: AppKPIProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        'transition-colors hover:bg-muted/50',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-foreground">{value}</span>
            {trend && trend !== 'neutral' && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-destructive'
                )}
              >
                {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

export default AppKPI;
