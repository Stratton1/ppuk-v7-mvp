import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/supabase';
import { cn } from '@/lib/utils';

type Property = Database['public']['Tables']['properties']['Row'];

type DashboardPropertyCardProps = {
  property: Property;
  completion: number;
  imageUrl?: string | null;
  /**
   * Use eager loading for the first, above-the-fold image to avoid LCP warnings.
   * Defaults to false to prevent over-fetching.
   */
  priority?: boolean;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  active: 'success',
  archived: 'warning',
};

const CompletionBar = ({ value }: { value: number }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const isComplete = clampedValue >= 100;
  const isLow = clampedValue < 30;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Completion Score</span>
        <span
          className={cn(
            'font-medium tabular-nums',
            isComplete && 'text-success',
            isLow && 'text-warning',
            !isComplete && !isLow && 'text-foreground'
          )}
        >
          {clampedValue}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete && 'bg-success',
            isLow && 'bg-warning',
            !isComplete && !isLow && 'bg-primary'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export const DashboardPropertyCard = ({
  property,
  completion,
  imageUrl,
  priority = false,
}: DashboardPropertyCardProps) => {
  const badgeVariant = statusVariants[property.status ?? ''] ?? 'secondary';

  return (
    <Card className="group overflow-hidden border-border bg-card transition-colors hover:border-primary/50">
      <Link href={`/properties/${property.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-xl">
        <div className="relative h-36 w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl || '/placeholder.svg'}
            alt={property.display_address ?? 'Property'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
          <div className="absolute right-2 top-2">
            <Badge variant={badgeVariant} className="capitalize text-[10px] shadow-sm">
              {property.status}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="line-clamp-2 text-sm font-medium leading-snug">
            {property.display_address}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 pt-0">
          <CompletionBar value={completion} />
        </CardContent>
      </Link>
      <CardFooter className="flex gap-2 border-t border-border bg-muted/30 px-3 py-2">
        <Button asChild variant="default" size="sm" className="flex-1 text-xs">
          <Link href={`/properties/${property.id}`}>View</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          data-testid="property-edit-button"
        >
          <Link href={`/properties/${property.id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
