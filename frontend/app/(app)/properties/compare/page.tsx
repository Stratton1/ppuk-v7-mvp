/**
 * File: compare/page.tsx
 * Purpose: Property comparison page for side-by-side property comparison
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { getBatchSignedUrls } from '@/lib/signed-url';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

interface ComparePageProps {
  searchParams: {
    ids?: string;
  };
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const propertyIds = searchParams.ids?.split(',').filter(Boolean) || [];

  if (propertyIds.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <AppPageHeader
          title="Compare Properties"
          description="Compare multiple properties side-by-side."
        />
        <AppSection>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-semibold">No properties selected</p>
              <p className="text-sm text-muted-foreground mt-2">
                Select properties to compare by adding ?ids=property-id-1,property-id-2 to the URL
              </p>
            </CardContent>
          </Card>
        </AppSection>
      </div>
    );
  }

  // Limit to 5 properties for comparison
  const limitedIds = propertyIds.slice(0, 5);

  // Fetch properties in parallel
  const propertyPromises = limitedIds.map(async (id) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) return null;

    // Check user can view property
    const canViewArgs: Database['public']['Functions']['can_view_property']['Args'] = {
      property_id: id,
    };
    const { data: canView } = await supabase.rpc('can_view_property', canViewArgs);

    if (!canView) return null;

    return data as PropertyRow;
  });

  const properties = (await Promise.all(propertyPromises)).filter(
    (p): p is PropertyRow => p !== null
  );

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <AppPageHeader
          title="Compare Properties"
          description="Compare multiple properties side-by-side."
        />
        <AppSection>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-semibold">No accessible properties found</p>
              <p className="text-sm text-muted-foreground mt-2">
                You don't have access to the selected properties.
              </p>
            </CardContent>
          </Card>
        </AppSection>
      </div>
    );
  }

  // Fetch completion scores
  const completionMap = new Map<string, number>();
  if (properties.length > 0) {
    const batchCompletionArgs: Database['public']['Functions']['get_properties_completion']['Args'] = {
      property_ids: properties.map((p) => p.id),
    };
    const { data: completionData } = await supabase.rpc(
      'get_properties_completion',
      batchCompletionArgs
    );

    completionData?.forEach((row) => {
      completionMap.set(row.property_id, row.completion);
    });
  }

  // Fetch document counts
  const documentCounts = new Map<string, number>();
  for (const property of properties) {
    const { count } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', property.id)
      .is('deleted_at', null);
    documentCounts.set(property.id, count || 0);
  }

  // Fetch media counts
  const mediaCounts = new Map<string, number>();
  for (const property of properties) {
    const { count } = await supabase
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', property.id)
      .is('deleted_at', null);
    mediaCounts.set(property.id, count || 0);
  }

  // Fetch featured media
  const signedUrlPaths = properties.map((p) => ({
    propertyId: p.id,
    bucket: 'property-photos',
    path: '', // Will be filled from media query
  }));

  const { data: mediaRows } = await supabase
    .from('media')
    .select('property_id, storage_path, storage_bucket')
    .in('property_id', properties.map((p) => p.id))
    .eq('status', 'active')
    .eq('media_type', 'photo')
    .order('created_at', { ascending: true });

  const featuredMediaMap = new Map<string, { storage_path: string; storage_bucket: string }>();
  const seenProperties = new Set<string>();
  mediaRows?.forEach((media) => {
    if (!seenProperties.has(media.property_id)) {
      featuredMediaMap.set(media.property_id, {
        storage_path: media.storage_path,
        storage_bucket: media.storage_bucket || 'property-photos',
      });
      seenProperties.add(media.property_id);
    }
  });

  const actualPaths = Array.from(featuredMediaMap.entries()).map(([propertyId, media]) => ({
    bucket: media.storage_bucket,
    path: media.storage_path,
    propertyId,
  }));

  const signedUrls = await getBatchSignedUrls(supabase, actualPaths.map(({ bucket, path }) => ({ bucket, path })));
  const signedUrlMap = new Map<string, string | null>();
  actualPaths.forEach(({ bucket, path, propertyId }) => {
    const key = `${bucket}:${path}`;
    signedUrlMap.set(propertyId, signedUrls.get(key) || null);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6">
      <AppPageHeader
        title="Compare Properties"
        description={`Comparing ${properties.length} properties side-by-side.`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                generateComparisonCSV(properties, completionMap, documentCounts, mediaCounts)
              )}`}
              download="property-comparison.csv"
            >
              Export CSV
            </a>
          </Button>
        }
      />

      <AppSection>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-semibold">Property</th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 text-left">
                    <div className="space-y-2">
                      <div className="font-semibold">{property.display_address}</div>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow label="UPRN" values={properties.map((p) => p.uprn)} />
              <ComparisonRow
                label="Completion"
                values={properties.map((p) => `${completionMap.get(p.id) || 0}%`)}
              />
              <ComparisonRow
                label="Documents"
                values={properties.map((p) => (documentCounts.get(p.id) || 0).toString())}
              />
              <ComparisonRow
                label="Media"
                values={properties.map((p) => (mediaCounts.get(p.id) || 0).toString())}
              />
              <ComparisonRow
                label="Status"
                values={properties.map((p) => p.status)}
              />
              <ComparisonRow
                label="Public"
                values={properties.map((p) => (p.public_visibility ? 'Yes' : 'No'))}
              />
              <ComparisonRow
                label="Created"
                values={properties.map((p) =>
                  new Date(p.created_at).toLocaleDateString('en-GB')
                )}
              />
            </tbody>
          </table>
        </div>
      </AppSection>

      <AppSection title="Property Details">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">{property.display_address}</div>
                <div className="text-sm text-muted-foreground">
                  UPRN: {property.uprn}
                </div>
                <div className="text-sm">
                  Completion: {completionMap.get(property.id) || 0}%
                </div>
                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                  <a href={`/properties/${property.id}`}>View Details</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </AppSection>
    </div>
  );
}

function ComparisonRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b">
      <td className="p-4 font-medium">{label}</td>
      {values.map((value, idx) => (
        <td key={idx} className="p-4">
          {value}
        </td>
      ))}
    </tr>
  );
}

function generateComparisonCSV(
  properties: PropertyRow[],
  completionMap: Map<string, number>,
  documentCounts: Map<string, number>,
  mediaCounts: Map<string, number>
): string {
  const headers = ['Property', 'UPRN', 'Status', 'Completion %', 'Documents', 'Media', 'Public', 'Created'];
  const rows = properties.map((property) => [
    property.display_address,
    property.uprn,
    property.status,
    (completionMap.get(property.id) || 0).toString(),
    (documentCounts.get(property.id) || 0).toString(),
    (mediaCounts.get(property.id) || 0).toString(),
    property.public_visibility ? 'Yes' : 'No',
    new Date(property.created_at).toLocaleDateString('en-GB'),
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

