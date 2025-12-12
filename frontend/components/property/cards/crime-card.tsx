/**
 * File: crime-card.tsx
 * Purpose: Crime statistics card component integrated with useCrimeData hook
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCrimeData } from '@/hooks/use-crime-data';

interface CrimeCardProps {
  propertyId?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
}

export function CrimeCard({
  propertyId,
  latitude,
  longitude,
  date,
}: CrimeCardProps) {
  const { data, isLoading, error, isFetching } = useCrimeData({
    propertyId,
    latitude,
    longitude,
    date,
    enabled: !!latitude && !!longitude,
  });

  if (isLoading || isFetching) {
    return (
      <Card data-testid="crime-card">
        <CardHeader>
          <CardTitle className="text-base">Crime Statistics</CardTitle>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="crime-card">
        <CardHeader>
          <CardTitle className="text-base">Crime Statistics</CardTitle>
          <Badge variant="outline" className="border-destructive/60 text-destructive">
            Error
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load crime data'}
        </CardContent>
      </Card>
    );
  }

  if (!data?.data || !data.success) {
    return (
      <Card data-testid="crime-card">
        <CardHeader>
          <CardTitle className="text-base">Crime Statistics</CardTitle>
          <Badge variant="outline">No data</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Crime statistics not available for this location.
        </CardContent>
      </Card>
    );
  }

  const { total_crimes, category_breakdown, date: crimeDate } = data.data;

  return (
    <Card data-testid="crime-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Crime Statistics</CardTitle>
        <Badge variant="outline">{total_crimes} crimes</Badge>
        {data.cached && (
          <Badge variant="outline" className="text-xs">Cached</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Period</span>
          <span className="font-medium">
            {crimeDate ? new Date(crimeDate + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Recent'}
          </span>
        </div>
        {Object.keys(category_breakdown).length > 0 && (
          <div className="space-y-2">
            <div className="text-muted-foreground text-xs font-medium">By category:</div>
            <div className="space-y-1">
              {Object.entries(category_breakdown)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {category.replace(/-/g, ' ')}
                    </span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
