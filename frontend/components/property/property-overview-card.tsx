import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function PropertyOverviewCard({ property, media }: PropertyOverviewCardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl" data-testid="property-title">
                {property.display_address}
              </CardTitle>
              <p className="text-sm text-muted-foreground">UPRN: {property.uprn}</p>
            </div>
            <Badge variant={property.status === 'active' ? 'default' : property.status === 'draft' ? 'secondary' : 'outline'}>
              {property.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <PropertyMeta property={property} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gallery</CardTitle>
          <p className="text-sm text-muted-foreground">Key photos for this property.</p>
        </CardHeader>
        <CardContent>
          <PropertyGallery propertyId={property.id} media={media} />
        </CardContent>
      </Card>
    </div>
  );
}
