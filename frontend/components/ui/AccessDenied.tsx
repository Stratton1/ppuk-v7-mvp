import { ShieldOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AccessDeniedProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  dataTestId?: string;
};

export function AccessDenied({
  title = 'Access denied',
  description = 'You do not have permission to view this content.',
  icon,
  actionLabel,
  actionHref,
  dataTestId,
}: AccessDeniedProps) {
  const displayIcon = icon ?? (
    <div className="rounded-full bg-muted p-2">
      <ShieldOff className="h-5 w-5" aria-hidden />
    </div>
  );

  return (
    <Card data-testid={dataTestId}>
      <CardHeader className="flex flex-row items-center gap-3">
        {displayIcon}
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <p>{description}</p>
        {actionLabel && actionHref && (
          <a className="text-primary underline" href={actionHref}>
            {actionLabel}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
