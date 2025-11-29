import { notFound } from 'next/navigation';
import type { Database } from '@/types/supabase';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PublicHero } from '@/components/public-passport/public-hero';
import { PublicMetadata } from '@/components/public-passport/public-metadata';
import { PublicGallery } from '@/components/public-passport/public-gallery';
import { PublicDocuments } from '@/components/public-passport/public-documents';
import { PLACEHOLDER_IMAGE } from '@/lib/signed-url';

type PublicProperty = {
  id: string;
  display_address: string;
  uprn: string | null;
  status: string;
  featured_media_path: string | null;
  gallery_paths: string[] | null;
  public_documents: string[] | null;
};

async function getSignedUrl(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  bucket: string,
  path: string | null | undefined
) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export default async function PublicPassportPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient();
  const publicPropertyArgs: Database['public']['Functions']['get_public_property']['Args'] = {
    slug: params.slug,
  };
  // Type assertion needed due to Supabase RPC type inference issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('get_public_property', publicPropertyArgs);

  if (error || !data || data.length === 0) {
    notFound();
  }

  const property = data[0] as PublicProperty;

  const featuredUrl =
    (await getSignedUrl(supabase, 'property-photos', property.featured_media_path)) || PLACEHOLDER_IMAGE;

  const gallerySigned = await Promise.all(
    (property.gallery_paths || []).map(async (path) => (await getSignedUrl(supabase, 'property-photos', path)) || '')
  ).then((urls) => urls.filter(Boolean));

  const documents = await Promise.all(
    (property.public_documents || []).map(async (path) => {
      const signed = await getSignedUrl(supabase, 'property-documents', path);
      return signed ? { name: path.split('/').pop() ?? 'Document', url: signed } : null;
    })
  ).then((docs) => docs.filter((d): d is { name: string; url: string } => !!d));

  return (
    <div className="space-y-6">
      <PublicHero address={property.display_address} status={property.status} imageUrl={featuredUrl} />
      <PublicMetadata uprn={property.uprn} status={property.status} />
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-primary">Gallery</h2>
        <PublicGallery images={gallerySigned} />
      </div>
      <PublicDocuments documents={documents} />
    </div>
  );
}
