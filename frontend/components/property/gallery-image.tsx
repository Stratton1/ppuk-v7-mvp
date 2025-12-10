/**
 * File: gallery-image.tsx
 * Purpose: Individual image card for property gallery
 * Type: Server Component
 */

import Image from 'next/image';
import { Database } from '@/types/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';
import { DeleteMediaButton } from './delete-media-button';

type Media = Database['public']['Tables']['media']['Row'];

interface GalleryImageProps {
  media: Media;
  signedUrl: string | null;
  propertyId: string;
  canDelete?: boolean;
}

export function GalleryImage({ media, signedUrl, propertyId, canDelete = false }: GalleryImageProps) {
  const imageUrl = signedUrl || PLACEHOLDER_IMAGE;

  // Format the created date
  const uploadedDate = new Date(media.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={media.title || 'Property image'}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Media Type Badge */}
        <div className="absolute left-2 top-2">
          <Badge variant="secondary" className="capitalize shadow-sm">
            {media.media_type}
          </Badge>
        </div>

        {/* Delete Button (visible on hover for authorized users) */}
        {canDelete && (
          <DeleteMediaButton
            mediaId={media.id}
            propertyId={propertyId}
            mediaTitle={media.title}
            mediaType={media.media_type}
          />
        )}
      </div>

      {/* Caption */}
      <div className="p-3">
        {media.title && (
          <p className="line-clamp-1 text-sm font-medium">{media.title}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Uploaded {uploadedDate}
        </p>
      </div>
    </Card>
  );
}
