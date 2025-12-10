import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { TitleData } from '@/lib/property-facts';

type TitleCardProps = {
  data: TitleData | null;
  loading?: boolean;
  error?: string;
};

export function TitleCard({ data, loading, error }: TitleCardProps) {
  if (loading) {
    return (
      <Card data-testid="keyfacts-title">
        <CardHeader>
          <CardTitle className="text-base">Title / Land Registry</CardTitle>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="keyfacts-title">
        <CardHeader>
          <CardTitle className="text-base">Title / Land Registry</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card data-testid="keyfacts-title">
        <CardHeader>
          <CardTitle className="text-base">Title / Land Registry</CardTitle>
          <Badge variant="outline">Not connected</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Title summary will appear here once Land Registry integration is wired.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="keyfacts-title">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Title / Land Registry</CardTitle>
        <Badge variant="outline">{data.tenure ?? 'Unknown tenure'}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Title number</span>
          <span className="font-medium">{data.titleNumber ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last updated</span>
          <span className="font-medium">{data.updatedAt ?? '—'}</span>
        </div>
        <div className="text-muted-foreground">
          <p>{data.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
