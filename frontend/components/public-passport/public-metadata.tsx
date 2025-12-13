import { Badge } from '@/components/ui/badge';

type PublicMetadataProps = {
  uprn?: string | null;
  status?: string | null;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  active: 'success',
  archived: 'warning',
};

export const PublicMetadata = ({ uprn, status }: PublicMetadataProps) => {
  const badgeVariant = statusVariants[status ?? ''] ?? 'secondary';

  return (
    <div className="rounded-xl border border-border bg-card p-5 md:p-6">
      <h2 className="text-base font-semibold text-foreground">Property Details</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
          <dt className="text-muted-foreground">UPRN</dt>
          <dd className="font-mono text-xs text-foreground">{uprn || 'Not provided'}</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge variant={badgeVariant} className="capitalize">
              {status || 'Unknown'}
            </Badge>
          </dd>
        </div>
      </dl>
    </div>
  );
};
