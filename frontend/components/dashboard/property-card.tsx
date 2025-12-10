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
};

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-amber-100 text-amber-800',
};

const CompletionBar = ({ value }: { value: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>Completion</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  </div>
);

export const DashboardPropertyCard = ({ property, completion, imageUrl }: DashboardPropertyCardProps) => {
  const statusClass = statusStyles[property.status ?? ''] ?? 'bg-slate-200 text-slate-800';

  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <div className="relative h-40 w-full bg-muted">
        <Image src={imageUrl || '/placeholder.svg'} alt={property.display_address ?? 'Property'} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="text-base">{property.display_address}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={cn(statusClass, 'capitalize')}>{property.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CompletionBar value={completion} />
      </CardContent>
      <CardFooter className="grid gap-2 md:grid-cols-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/properties/${property.id}`}>View Passport</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" data-testid="property-edit-button">
          <Link href={`/properties/${property.id}/edit`}>Edit</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/properties/${property.id}/documents/upload`}>Upload Doc</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/properties/${property.id}/media/upload`}>Upload Photo</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
