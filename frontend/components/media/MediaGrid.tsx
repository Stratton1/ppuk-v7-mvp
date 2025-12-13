import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UidMedia } from '@/lib/media/types';

type MediaGridProps = {
  media: UidMedia[];
};

export function MediaGrid({ media }: MediaGridProps) {
  if (!media || media.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">No media available</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload photos, floorplans, or videos to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="media-grid">
      {media.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden border-border transition-colors hover:border-primary/50"
          data-testid={`media-item-${item.id}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm capitalize">{item.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {item.url ? (
              <div className="relative h-40 w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.url}
                  alt={item.category}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                No preview
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(item.uploadedAt).toLocaleDateString('en-GB')}</span>
              {item.mimeType && (
                <>
                  <span>•</span>
                  <span>{item.mimeType}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
