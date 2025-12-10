/**
 * File: property-gallery.tsx
 * Purpose: Display all property media in a responsive grid
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GalleryImage } from './gallery-image';
import { getFeaturedMediaUrl } from '@/lib/signed-url';
import { UploadPhotoDialog } from './upload-photo-dialog';

type PropertyMedia = Database['public']['Tables']['media']['Row'];

interface PropertyGalleryProps {
  propertyId: string;
  media: PropertyMedia[];
}

export async function PropertyGallery({ propertyId, media }: PropertyGalleryProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user can delete media (owner, admin, agent, surveyor)
  const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
    property_id: propertyId,
    allowed_roles: ['owner', 'editor'],
  };
  const { data: canDelete } = await supabase.rpc('has_property_role', hasPropertyRoleArgs);

  // Filter photos and floorplans
  const photos = media.filter(
    (m) => m.media_type === 'photo' || m.media_type === 'floorplan'
  );

  // Generate signed URLs for all media
  const mediaWithUrls = await Promise.all(
    photos.map(async (item) => {
      const signedUrl = await getFeaturedMediaUrl(item.storage_path);
      return { media: item, signedUrl };
    })
  );

  // Handle empty state
  if (mediaWithUrls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Property Gallery</CardTitle>
            <UploadPhotoDialog propertyId={propertyId} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No photos available for this property.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload photos to showcase this property.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Property Gallery</CardTitle>
            <p className="text-sm text-muted-foreground">
              {mediaWithUrls.length} {mediaWithUrls.length === 1 ? 'image' : 'images'}
            </p>
          </div>
          <UploadPhotoDialog propertyId={propertyId} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mediaWithUrls.map(({ media, signedUrl }) => (
            <GalleryImage
              key={media.id}
              media={media}
              signedUrl={signedUrl}
              propertyId={propertyId}
              canDelete={canDelete || false}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
