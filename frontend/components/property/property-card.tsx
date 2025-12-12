/**
 * File: property-card.tsx
 * Purpose: Display individual property card with featured image and key details
 * Type: Server Component
 */

import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type Property = Database['public']['Tables']['properties']['Row'];
interface PropertyCardProps {
  property: Property;
  signedUrl?: string | null;
  /**
   * Mark above-the-fold cards as priority to satisfy LCP guidance.
   */
  priority?: boolean;
}

export function PropertyCard({ property, signedUrl, priority = false }: PropertyCardProps) {
  // Determine status badge variant
  const statusVariant = property.status === 'active' 
    ? 'default' 
    : property.status === 'draft' 
    ? 'secondary' 
    : 'outline';

  // Use signed URL or placeholder
  const imageUrl = signedUrl || PLACEHOLDER_IMAGE;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Featured Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={property.display_address}
          fill
          className="object-cover"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
        {/* Status Badge Overlay */}
        <div className="absolute right-2 top-2">
          <Badge variant={statusVariant} className="capitalize">
            {property.status}
          </Badge>
        </div>
      </div>

      {/* Property Details */}
      <CardHeader className="flex-1">
        <h3 className="line-clamp-2 text-lg font-semibold">
          {property.display_address}
        </h3>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono text-xs">UPRN: {property.uprn}</span>
        </div>
        {property.latitude && property.longitude && (
          <div className="text-xs text-muted-foreground">
            {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
          </div>
        )}
      </CardContent>

      {/* Action Footer */}
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/properties/${property.id}`}>
            View Property
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Skeleton loader for PropertyCard component
 */
export function PropertyCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Featured Image Skeleton */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Property Details Skeleton */}
      <CardHeader className="flex-1 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </CardContent>

      {/* Action Footer Skeleton */}
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
