import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaUploadForm } from '@/components/media/MediaUploadForm';
import { mediaRowToUidMedia, type UidMedia } from '@/lib/media/types';
import { uploadMediaAction } from '@/actions/media';
import { canUploadMedia } from '@/lib/permissions/documents';
import { TimelineList } from '@/components/events/TimelineList';
import { getEventsForProperty } from '@/actions/events';
import type { Database } from '@/types/supabase';

interface PropertyMediaPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyMediaPage({ params }: PropertyMediaPageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id')
    .eq('id', id)
    .single();

  if (propertyError || !property) {
    notFound();
  }

  // Fetch all media for this property
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allMedia } = await (supabase as any)
    .from('media')
    .select('*')
    .eq('property_id', id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const media: UidMedia[] = allMedia ? await Promise.all(allMedia.map((row: unknown) => mediaRowToUidMedia(row as any))) : [];
  const canUpload = await canUploadMedia(id);
  const events = await getEventsForProperty(id);

  return (
    <div className="space-y-6" data-testid="property-media-loaded">
      {canUpload && (
        <AppSection id="media-upload" title="Upload media" description="Add photos, floorplans, or videos.">
          <MediaUploadForm propertyId={id} action={uploadMediaAction} />
        </AppSection>
      )}

      <AppSection
        id="gallery"
        title="Media gallery"
        description="Photos, floorplans, videos, and more."
      >
        <MediaGrid media={media} />
      </AppSection>

      <AppSection id="media-events" title="Media events" description="Recent uploads and removals.">
        <TimelineList items={events.filter((e) => e.type.startsWith('media.'))} />
      </AppSection>
    </div>
  );
}
