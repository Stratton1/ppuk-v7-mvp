import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { PropertyHeader } from '@/components/property/property-header';
import type { Database } from '@/types/supabase';

type PropertyLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export default async function PropertyLayout({ children, params }: PropertyLayoutProps) {
  const supabase = createServerClient();

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!property) {
    notFound();
  }

  const { data: media } = await supabase
    .from('media')
    .select('id, storage_path')
    .eq('property_id', params.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .limit(1);

  const propertyTyped = property as Database['public']['Tables']['properties']['Row'];
  const featuredMedia = (media ?? [])[0] ?? null;

  return (
    <div className="space-y-6">
      <PropertyHeader property={propertyTyped} featuredMedia={featuredMedia} />
      {children}
    </div>
  );
}
