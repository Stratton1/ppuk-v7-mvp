import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UidMedia } from '@/lib/media/types';

type MediaGridProps = {
  media: UidMedia[];
};

export function MediaGrid({ media }: MediaGridProps) {
  if (!media || media.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No media available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="media-grid">
      {media.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm"
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
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 text-xs text-muted-foreground">
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
