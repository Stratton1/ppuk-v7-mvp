/**
 * File: title-card-integrated.tsx
 * Purpose: Title/Land Registry card component integrated with useHmlrData hook
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHmlrData } from '@/hooks/use-hmlr-data';

interface TitleCardIntegratedProps {
  propertyId?: string;
  titleNumber?: string;
  uprn?: string;
  postcode?: string;
}

export function TitleCardIntegrated({
  propertyId,
  titleNumber,
  uprn,
  postcode,
}: TitleCardIntegratedProps) {
  const { data, isLoading, error, isFetching } = useHmlrData({
    propertyId,
    titleNumber,
    uprn,
    postcode,
    enabled: !!(titleNumber || uprn || postcode),
  });

  if (isLoading || isFetching) {
    return (
      <Card data-testid="title-card">
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
      <Card data-testid="title-card">
        <CardHeader>
          <CardTitle className="text-base">Title / Land Registry</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load title data'}
        </CardContent>
      </Card>
    );
  }

  if (!data?.data || !data.success) {
    return (
      <Card data-testid="title-card">
        <CardHeader>
          <CardTitle className="text-base">Title / Land Registry</CardTitle>
          <Badge variant="outline">No data</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Title data not available for this property.
        </CardContent>
      </Card>
    );
  }

  const { title_number, tenure, price_history } = data.data;

  return (
    <Card data-testid="title-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Title / Land Registry</CardTitle>
        <Badge variant="outline">{tenure || 'Unknown'}</Badge>
        {data.cached && (
          <Badge variant="outline" className="text-xs">Cached</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {title_number && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Title number</span>
            <span className="font-medium font-mono text-xs">{title_number}</span>
          </div>
        )}
        {price_history && price_history.length > 0 && (
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs font-medium">Price history:</div>
            {price_history.slice(0, 3).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : 'Unknown date'}
                </span>
                <span className="font-medium">
                  £{entry.price?.toLocaleString('en-GB') || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        )}
        {data.data.last_updated && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last updated</span>
            <span>{new Date(data.data.last_updated).toLocaleDateString('en-GB')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

