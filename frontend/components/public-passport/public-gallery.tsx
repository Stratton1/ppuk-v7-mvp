import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PublicGalleryProps = {
  images: string[];
};

export const PublicGallery = ({ images }: PublicGalleryProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">No photos available</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This property passport has no public images.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          className="group relative h-44 w-full overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-primary/50"
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
