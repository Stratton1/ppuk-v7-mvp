import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { PlanningData } from '@/lib/property-facts';

type PlanningCardProps = {
  data: PlanningData | null;
  loading?: boolean;
  error?: string;
};

export function PlanningCard({ data, loading, error }: PlanningCardProps) {
  if (loading) {
    return (
      <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-planning">
        <CardHeader>
          <CardTitle className="text-base">Planning</CardTitle>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-planning">
        <CardHeader>
          <CardTitle className="text-base">Planning</CardTitle>
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
      <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-planning">
        <CardHeader>
          <CardTitle className="text-base">Planning</CardTitle>
          <Badge variant="outline">Not connected</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Planning history and applications will appear here once connected to a data source.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border transition-colors hover:border-primary/50" data-testid="keyfacts-planning">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Planning</CardTitle>
        <Badge variant="outline">{data.status ?? 'Mixed'}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <span className="text-muted-foreground">Recent apps</span>
          <span className="font-medium text-foreground">{data.recentApplications.length}</span>
        </div>
        <div className="space-y-2">
          {data.recentApplications.slice(0, 3).map((app) => (
            <div key={app.reference} className="flex items-center justify-between gap-2 rounded-lg bg-muted/30 px-3 py-2">
              <span className="truncate text-xs text-muted-foreground">{app.reference}</span>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {app.status}
              </Badge>
            </div>
          ))}
          {data.recentApplications.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent applications.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
