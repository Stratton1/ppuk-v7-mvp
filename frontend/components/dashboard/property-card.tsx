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

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-amber-100 text-amber-800',
};

const CompletionBar = ({ value }: { value: number }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>Completion</span>
      <span className="font-medium">{value}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export const DashboardPropertyCard = ({ property, completion, imageUrl, priority = false }: DashboardPropertyCardProps) => {
  const statusClass = statusStyles[property.status ?? ''] ?? 'bg-slate-200 text-slate-800';

  return (
    <Card className="group overflow-hidden border-border/60 bg-card/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-glow-sm">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl || '/placeholder.svg'}
          alt={property.display_address ?? 'Property'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
        />
        <div className="absolute right-3 top-3">
          <Badge className={cn(statusClass, 'capitalize shadow-sm')}>{property.status}</Badge>
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 text-base leading-snug">{property.display_address}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <CompletionBar value={completion} />
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t border-border/40 bg-muted/30 px-4 py-3">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/properties/${property.id}`}>View Passport</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full" data-testid="property-edit-button">
          <Link href={`/properties/${property.id}/edit`}>Edit</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
          <Link href={`/properties/${property.id}/documents/upload`}>Upload Doc</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
          <Link href={`/properties/${property.id}/media/upload`}>Upload Photo</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
