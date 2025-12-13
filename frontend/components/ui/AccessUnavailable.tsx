import { Ban } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

type AccessUnavailableProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  dataTestId?: string;
};

export function AccessUnavailable({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  dataTestId,
}: AccessUnavailableProps) {
  const displayIcon = icon ?? <Ban className="h-5 w-5" aria-hidden />;

  return (
    <EmptyState
      dataTestId={dataTestId}
      variant="warning"
      icon={displayIcon}
      title={title}
      description={description}
      action={
        actionLabel && actionHref ? (
          <Button variant="outline" size="sm" asChild>
            <a href={actionHref}>{actionLabel}</a>
          </Button>
        ) : undefined
      }
    />
  );
}
