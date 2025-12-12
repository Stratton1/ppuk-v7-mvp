/**
 * File: property-meta-section.tsx
 * Purpose: Display core property metadata (address, UPRN, coordinates, status)
 * Type: Server Component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

interface PropertyMetaSectionProps {
  property: PropertyRow;
}

export function PropertyMetaSection({ property }: PropertyMetaSectionProps) {
  return (
    <Card data-testid="property-meta-section">
      <CardHeader>
        <CardTitle className="text-lg">Property details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <MetaItem label="Display address" value={property.display_address} />
          <MetaItem label="UPRN" value={property.uprn} mono />
          <MetaItem
            label="Status"
            value={
              <Badge
                variant={property.status === 'active' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {property.status}
              </Badge>
            }
          />
          <MetaItem
            label="Visibility"
            value={
              <Badge variant={property.public_visibility ? 'default' : 'outline'}>
                {property.public_visibility ? 'Public' : 'Private'}
              </Badge>
            }
          />
          {property.latitude && property.longitude && (
            <>
              <MetaItem
                label="Latitude"
                value={property.latitude.toFixed(6)}
                mono
              />
              <MetaItem
                label="Longitude"
                value={property.longitude.toFixed(6)}
                mono
              />
            </>
          )}
          {property.public_slug && (
            <MetaItem
              label="Public slug"
              value={
                <a
                  href={`/p/${property.public_slug}`}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /p/{property.public_slug}
                </a>
              }
            />
          )}
          <MetaItem
            label="Created"
            value={new Date(property.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <MetaItem
            label="Last updated"
            value={new Date(property.updated_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

interface MetaItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function MetaItem({ label, value, mono }: MetaItemProps) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
