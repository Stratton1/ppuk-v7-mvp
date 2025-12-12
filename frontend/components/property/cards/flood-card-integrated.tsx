/**
 * File: flood-card-integrated.tsx
 * Purpose: Flood risk card component integrated with useFloodRisk hook
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFloodRisk } from '@/hooks/use-flood-risk';

interface FloodCardIntegratedProps {
  propertyId?: string;
  latitude?: number;
  longitude?: number;
  uprn?: string;
}

export function FloodCardIntegrated({
  propertyId,
  latitude,
  longitude,
  uprn,
}: FloodCardIntegratedProps) {
  const { data, isLoading, error, isFetching } = useFloodRisk({
    propertyId,
    latitude,
    longitude,
    uprn,
    enabled: !!latitude && !!longitude,
  });

  if (isLoading || isFetching) {
    return (
      <Card data-testid="flood-card">
        <CardHeader>
          <CardTitle className="text-base">Flood Risk</CardTitle>
          <Skeleton className="h-4 w-28" />
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
      <Card data-testid="flood-card">
        <CardHeader>
          <CardTitle className="text-base">Flood Risk</CardTitle>
          <Badge variant="outline" className="border-destructive/60 text-destructive">
            Error
          </Badge>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load flood risk data'}
        </CardContent>
      </Card>
    );
  }

  if (!data?.data || !data.success) {
    return (
      <Card data-testid="flood-card">
        <CardHeader>
          <CardTitle className="text-base">Flood Risk</CardTitle>
          <Badge variant="outline">No data</Badge>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Flood risk data not available for this property.
        </CardContent>
      </Card>
    );
  }

  const riskLevel = data.data.risk_level || 'low';
  
  // Risk level badge variant
  const getRiskVariant = (level: string): 'default' | 'secondary' | 'outline' => {
    if (level === 'medium') return 'secondary';
    if (level === 'very_high' || level === 'high') return 'outline';
    return 'default';
  };
  const getRiskClassName = (level: string) => {
    if (level === 'very_high' || level === 'high') {
      return 'border-destructive/60 text-destructive';
    }
    return undefined;
  };

  const getRiskLabel = (level: string) => {
    return level.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card data-testid="flood-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Flood Risk</CardTitle>
        <Badge variant={getRiskVariant(riskLevel)} className={getRiskClassName(riskLevel)}>
          {getRiskLabel(riskLevel)}
        </Badge>
        {data.cached && (
          <Badge variant="outline" className="text-xs">Cached</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="text-muted-foreground">
          <p>
            {riskLevel === 'low' && 'Low risk of flooding from rivers, sea, and surface water.'}
            {riskLevel === 'medium' && 'Medium risk of flooding. Consider flood mitigation measures.'}
            {riskLevel === 'high' && 'High risk of flooding. Flood protection recommended.'}
            {riskLevel === 'very_high' && 'Very high risk of flooding. Flood protection essential.'}
          </p>
        </div>
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
