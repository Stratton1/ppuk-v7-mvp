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
      <Card data-testid="keyfacts-epc">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Skeleton className="h-4 w-24" />
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
      <Card data-testid="keyfacts-epc">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card data-testid="keyfacts-epc">
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
    <Card data-testid="keyfacts-epc">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">EPC</CardTitle>
        <Badge variant="outline">{data.rating}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Certificate</span>
          <span className="font-medium">{data.certificateNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Valid until</span>
          <span className="font-medium">{data.validUntil ?? '—'}</span>
        </div>
        <div className="text-muted-foreground">
          <p>{data.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
