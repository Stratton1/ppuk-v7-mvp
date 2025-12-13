import Image from 'next/image';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PublicGalleryProps = {
  images: string[];
};

export const PublicGallery = ({ images }: PublicGalleryProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 text-center text-sm text-muted-foreground shadow-sm">
        No public images available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          className="group relative h-44 w-full overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm"
        >
          <Image
            src={src || PLACEHOLDER_IMAGE}
            alt="Property media"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
};
