import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { FloodData } from '@/lib/property-facts';

type FloodCardProps = {
  data: FloodData | null;
  loading?: boolean;
  error?: string;
};

export function FloodCard({ data, loading, error }: FloodCardProps) {
  if (loading) {
    return (
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm" data-testid="keyfacts-flood">
        <CardHeader>
          <CardTitle className="text-base">Flood risk</CardTitle>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm" data-testid="keyfacts-flood">
        <CardHeader>
          <CardTitle className="text-base">Flood risk</CardTitle>
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
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm" data-testid="keyfacts-flood">
        <CardHeader>
          <CardTitle className="text-base">Flood risk</CardTitle>
          <Badge variant="outline">Not connected</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Flood risk data will appear here once a data source is connected.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm" data-testid="keyfacts-flood">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Flood risk</CardTitle>
        <Badge variant="outline">{data.riskLevel}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <span className="text-muted-foreground">Zone</span>
          <span className="font-medium text-foreground">{data.zone ?? '—'}</span>
        </div>
        <p className="text-muted-foreground">{data.summary}</p>
      </CardContent>
    </Card>
  );
}
