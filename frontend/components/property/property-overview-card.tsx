import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/supabase';
import { PropertyMeta } from './property-meta';
import { PropertyGallery } from './property-gallery';

type Property = Database['public']['Tables']['properties']['Row'];
type MediaRow = Database['public']['Tables']['media']['Row'];

type PropertyOverviewCardProps = {
  property: Property;
  media: MediaRow[];
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  archived: 'outline',
};

export function PropertyOverviewCard({ property, media }: PropertyOverviewCardProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl leading-snug" data-testid="property-title">
                {property.display_address}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                UPRN: {property.uprn}
              </CardDescription>
            </div>
            <Badge
              variant={statusVariants[property.status ?? ''] ?? 'outline'}
              className="shrink-0 capitalize"
            >
              {property.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <PropertyMeta property={property} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gallery</CardTitle>
          <CardDescription>Key photos for this property.</CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyGallery propertyId={property.id} media={media} />
        </CardContent>
      </Card>
    </div>
  );
}
