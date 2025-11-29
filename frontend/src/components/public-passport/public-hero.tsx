import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PublicHeroProps = {
  address: string;
  status: string;
  imageUrl?: string | null;
};

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-amber-100 text-amber-800',
};

export const PublicHero = ({ address, status, imageUrl }: PublicHeroProps) => {
  const statusClass = statusStyles[status] ?? 'bg-slate-200 text-slate-800';

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="relative h-72 w-full bg-muted">
        <Image src={imageUrl || PLACEHOLDER_IMAGE} alt={address} fill className="object-cover" />
        <div className="absolute right-4 top-4">
          <Badge className={statusClass}>{status}</Badge>
        </div>
      </div>
      <div className="p-6">
        <h1 className="text-3xl font-semibold text-primary">{address}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public property passport — limited, safe fields only.
        </p>
      </div>
    </section>
  );
};
