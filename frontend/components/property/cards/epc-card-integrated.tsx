/**
 * File: epc-card-integrated.tsx
 * Purpose: EPC card component integrated with useEpcData hook
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEpcData } from '@/hooks/use-epc-data';

interface EpcCardIntegratedProps {
  propertyId?: string;
  uprn?: string;
  postcode?: string;
  address?: string;
}

export function EpcCardIntegrated({
  propertyId,
  uprn,
  postcode,
  address,
}: EpcCardIntegratedProps) {
  const { data, isLoading, error, isFetching } = useEpcData({
    propertyId,
    uprn,
    postcode,
    address,
    enabled: !!(uprn || postcode || address),
  });

  if (isLoading || isFetching) {
    return (
      <Card data-testid="epc-card">
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
      <Card data-testid="epc-card">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Badge variant="destructive">Error</Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load EPC data'}
        </CardContent>
      </Card>
    );
  }

  if (!data?.data || !data.success) {
    return (
      <Card data-testid="epc-card">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Badge variant="outline">No data</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {data?.data?.message || 'EPC data not available for this property.'}
        </CardContent>
      </Card>
    );
  }

  const epcRecords = data.data.data || [];
  const latestEpc = epcRecords[0];

  if (!latestEpc) {
    return (
      <Card data-testid="epc-card">
        <CardHeader>
          <CardTitle className="text-base">EPC</CardTitle>
          <Badge variant="outline">No certificate</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No EPC certificate found for this property.
        </CardContent>
      </Card>
    );
  }

  const rating = latestEpc['current-energy-rating'] || 'N/A';
  const efficiency = latestEpc['current-energy-efficiency'] || null;
  const lodgementDate = latestEpc['lodgement-date'] || null;

  // Rating badge variant based on rating
  const getRatingVariant = (rating: string) => {
    if (['A', 'B'].includes(rating)) return 'default';
    if (['C', 'D'].includes(rating)) return 'secondary';
    if (['E', 'F'].includes(rating)) return 'outline';
    return 'destructive';
  };

  return (
    <Card data-testid="epc-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">EPC</CardTitle>
        <Badge variant={getRatingVariant(rating)}>{rating}</Badge>
        {data.cached && (
          <Badge variant="outline" className="text-xs">Cached</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {efficiency !== null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Energy efficiency</span>
            <span className="font-medium">{efficiency} SAP</span>
          </div>
        )}
        {lodgementDate && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Lodged</span>
            <span className="font-medium">
              {new Date(lodgementDate).toLocaleDateString('en-GB')}
            </span>
          </div>
        )}
        {latestEpc['total-floor-area'] && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Floor area</span>
            <span className="font-medium">
              {latestEpc['total-floor-area']} m²
            </span>
          </div>
        )}
        {latestEpc['main-fuel-type'] && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Main fuel</span>
            <span className="font-medium">{latestEpc['main-fuel-type']}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

