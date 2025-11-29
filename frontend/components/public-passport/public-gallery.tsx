import Image from 'next/image';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PublicGalleryProps = {
  images: string[];
};

export const PublicGallery = ({ images }: PublicGalleryProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
        No public images available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((src, idx) => (
        <div key={`${src}-${idx}`} className="relative h-40 w-full overflow-hidden rounded-lg border bg-muted">
          <Image src={src || PLACEHOLDER_IMAGE} alt="Property media" fill className="object-cover" />
        </div>
      ))}
    </div>
  );
};
