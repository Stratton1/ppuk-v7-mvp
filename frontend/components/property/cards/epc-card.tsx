import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { EPCData } from '@/lib/property-facts';

type EpcCardProps = {
  data: EPCData | null;
  loading?: boolean;
  error?: string;
};

export function EpcCard({ data, loading, error }: EpcCardProps) {
  if (loading) {
    return (
      <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-epc">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-epc">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Badge variant="outline" className="border-destructive/60 text-destructive">
            Error
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-epc">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Badge variant="outline">Not connected</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Energy performance data will appear here once an EPC integration is connected.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-epc">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">EPC</CardTitle>
        <Badge variant="outline">{data.rating}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <span className="text-muted-foreground">Certificate</span>
          <span className="font-medium text-foreground">{data.certificateNumber}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <span className="text-muted-foreground">Valid until</span>
          <span className="font-medium text-foreground">{data.validUntil ?? '—'}</span>
        </div>
        <p className="text-muted-foreground">{data.summary}</p>
      </CardContent>
    </Card>
  );
}
