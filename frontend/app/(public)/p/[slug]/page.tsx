import { notFound } from 'next/navigation';
import type { Database } from '@/types/supabase';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { PublicHero } from '@/components/public-passport/public-hero';
import { PublicMetadata } from '@/components/public-passport/public-metadata';
import { PublicGallery } from '@/components/public-passport/public-gallery';
import { PublicDocuments } from '@/components/public-passport/public-documents';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type MediaRow = Pick<
  Database['public']['Tables']['media']['Row'],
  'storage_path' | 'storage_bucket' | 'media_type' | 'created_at' | 'deleted_at'
>;
type DocumentRow = Pick<
  Database['public']['Tables']['documents']['Row'],
  'storage_path' | 'storage_bucket' | 'title' | 'status' | 'deleted_at' | 'created_at'
>;

async function getSignedUrl(
  supabase: ReturnType<typeof createServerClient>,
  bucket: string,
  path: string | null | undefined
) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export default async function PublicPassportPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, display_address, uprn, status, public_slug, public_visibility, deleted_at')
    .eq('public_slug', params.slug)
    .eq('public_visibility', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (propertyError || !property) {
    notFound();
  }
  const publicProperty = property as PropertyRow;

  const { data: mediaRows } = await supabase
    .from('media')
    .select('storage_path, storage_bucket, media_type, created_at, deleted_at')
    .eq('property_id', publicProperty.id)
    .eq('media_type', 'photo')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const mediaList: MediaRow[] = mediaRows ?? [];
  const featuredMedia = mediaList[0];

  const featuredUrl =
    (await getSignedUrl(
      supabase,
      (featuredMedia?.storage_bucket as string | undefined) || 'property-photos',
      featuredMedia?.storage_path
    )) || PLACEHOLDER_IMAGE;

  const gallerySigned = await Promise.all(
    mediaList.map(
      async (item) =>
        (await getSignedUrl(supabase, item.storage_bucket || 'property-photos', item.storage_path)) || ''
    )
  ).then((urls) => urls.filter(Boolean));

  const { data: documentRows } = await supabase
    .from('documents')
    .select('storage_path, storage_bucket, title, status, deleted_at, created_at')
    .eq('property_id', publicProperty.id)
    .is('deleted_at', null)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  const documents = await Promise.all(
    ((documentRows as DocumentRow[] | null) ?? []).map(async (doc) => {
      const signed = await getSignedUrl(supabase, doc.storage_bucket || 'property-documents', doc.storage_path);
      const name = doc.title || doc.storage_path.split('/').pop() || 'Document';
      return signed ? { name, url: signed } : null;
    })
  ).then((docs) => docs.filter((d): d is { name: string; url: string } => !!d));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6" data-testid="public-passport-root">
      <PublicHero address={publicProperty.display_address} status={publicProperty.status} imageUrl={featuredUrl} />
      <PublicMetadata uprn={publicProperty.uprn} status={publicProperty.status} />
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-primary">Gallery</h2>
        <PublicGallery images={gallerySigned} />
      </div>
      <PublicDocuments documents={documents} />
    </div>
  );
}
