/**
 * File: property-meta.tsx
 * Purpose: Display key property metadata (UPRN, coordinates, created date, status)
 * Type: Server Component
 */

import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyMetaProps {
  property: Property;
}

export function PropertyMeta({ property }: PropertyMetaProps) {
  // Format date
  const createdDate = new Date(property.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const updatedDate = new Date(property.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* UPRN */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">UPRN</dt>
            <dd className="font-mono text-sm">{property.uprn}</dd>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="text-sm capitalize">{property.status}</dd>
          </div>

          {/* Coordinates */}
          {property.latitude && property.longitude && (
            <div className="space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">Coordinates</dt>
              <dd className="font-mono text-xs">
                {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </dd>
            </div>
          )}

          {/* Created Date */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Created</dt>
            <dd className="text-sm">{createdDate}</dd>
          </div>

          {/* Last Updated */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
            <dd className="text-sm">{updatedDate}</dd>
          </div>

          {/* Property ID */}
          <div className="space-y-1">
            <dt className="text-sm font-medium text-muted-foreground">Property ID</dt>
            <dd className="truncate font-mono text-xs" title={property.id}>
              {property.id}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

