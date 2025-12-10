import React from 'react';
import { cn } from '@/lib/utils';

type AppKPIProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function AppKPI({ label, value, hint, icon, className }: AppKPIProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm shadow-glow-xs backdrop-blur transition hover:-translate-y-0.5 hover:shadow-glow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="text-2xl font-semibold text-primary">{value}</div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

export default AppKPI;
