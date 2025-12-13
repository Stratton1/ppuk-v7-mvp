import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'muted' | 'warning' | 'error';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: EmptyStateVariant;
  className?: string;
  dataTestId?: string;
};

const variantStyles: Record<EmptyStateVariant, { container: string; icon: string }> = {
  default: {
    container: 'border-border bg-card',
    icon: 'bg-muted text-muted-foreground',
  },
  muted: {
    container: 'border-dashed border-border bg-muted/30',
    icon: 'bg-muted text-muted-foreground',
  },
  warning: {
    container: 'border-warning/20 bg-warning/5',
    icon: 'bg-warning/10 text-warning',
  },
  error: {
    container: 'border-destructive/20 bg-destructive/5',
    icon: 'bg-destructive/10 text-destructive',
  },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
  dataTestId,
}: EmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border px-6 py-10 text-center',
        'animate-fade-in',
        styles.container,
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-full',
            styles.icon
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
