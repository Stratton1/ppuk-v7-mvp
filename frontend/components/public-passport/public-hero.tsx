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
    <section className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm shadow-glow-xs transition-shadow duration-300 hover:shadow-glow-sm">
      <div className="relative h-72 w-full overflow-hidden bg-muted md:h-80">
        <Image
          src={imageUrl || PLACEHOLDER_IMAGE}
          alt={address}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute right-4 top-4">
          <Badge className={`${statusClass} capitalize shadow-md`}>{status}</Badge>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-semibold leading-tight text-primary md:text-3xl">{address}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Public property passport — limited, safe fields only.
        </p>
      </div>
    </section>
  );
};
