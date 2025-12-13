import Image from 'next/image';
import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PublicHeroProps = {
  address: string;
  status: string;
  imageUrl?: string | null;
};

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  draft: 'secondary',
  active: 'success',
  archived: 'warning',
};

export const PublicHero = ({ address, status, imageUrl }: PublicHeroProps) => {
  const badgeVariant = statusVariants[status] ?? 'secondary';

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative h-64 w-full overflow-hidden bg-muted md:h-72">
        <Image
          src={imageUrl || PLACEHOLDER_IMAGE}
          alt={address}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <Badge variant={badgeVariant} className="capitalize shadow-sm">
            {status}
          </Badge>
          <Badge variant="info" className="shadow-sm">
            <Globe className="mr-1 h-3 w-3" />
            Public
          </Badge>
        </div>
      </div>
      <div className="space-y-2 p-5 md:p-6">
        <h1 className="text-2xl font-semibold leading-tight text-foreground md:text-3xl">
          {address}
        </h1>
        <p className="text-sm text-muted-foreground">
          Public Property Passport — verified, safe information only.
        </p>
      </div>
    </section>
  );
};
