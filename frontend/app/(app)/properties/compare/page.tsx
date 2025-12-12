/**
 * File: compare/page.tsx
 * Purpose: Property comparison page for side-by-side property comparison
 */

import { use } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { getBatchSignedUrls } from '@/lib/signed-url';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccessUnavailable } from '@/components/ui/AccessUnavailable';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

interface ComparePageProps {
  searchParams: Promise<{
    ids?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = use(searchParams);
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();
  const propertyIds = resolvedSearchParams.ids?.split(',').filter(Boolean) || [];

  if (propertyIds.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <AppPageHeader
          title="Compare Properties"
          description="Compare multiple properties side-by-side."
        />
        <AppSection>
          <AccessUnavailable
            title="No properties selected"
            description="Add ?ids=property-id-1,property-id-2 to the URL to compare properties."
            dataTestId="compare-no-properties"
          />
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

    if (error || !data) return { property: null, restrictedId: id };

    // Check user can view property
    const canViewArgs: Database['public']['Functions']['can_view_property']['Args'] = {
      property_id: id,
    };
    const { data: canView } = await supabase.rpc('can_view_property', canViewArgs);

    if (!canView) return { property: null, restrictedId: id };

    return { property: data as PropertyRow, restrictedId: null };
  });

  const propertyResults = await Promise.all(propertyPromises);
  const properties = propertyResults.flatMap((result) => (result.property ? [result.property] : []));
  const restrictedIds = propertyResults.flatMap((result) => (result.restrictedId ? [result.restrictedId] : []));

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <AppPageHeader
          title="Compare Properties"
          description="Compare multiple properties side-by-side."
        />
        <AppSection>
          <AccessUnavailable
            title="No accessible properties found"
            description="You don't have permission to view any of the selected properties."
            dataTestId="compare-all-restricted"
          />
        </AppSection>
      </div>
    );
  }

  // Fetch completion scores
  const completionMap = new Map<string, number>();
  if (properties.length > 0) {
    // Note: get_properties_completion RPC function may not exist in schema yet - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: completionData } = await (supabase as any).rpc(
      'get_properties_completion',
      { property_ids: properties.map((p) => p.id) }
    );

    (completionData as { property_id: string; completion: number }[] | null)?.forEach((row) => {
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
          <table className="w-full border-collapse" data-testid="compare-table">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-semibold">Property</th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 text-left" data-testid={`compare-col-${property.id}`}>
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
              <ComparisonRow label="UPRN" values={properties.map((p) => p.uprn)} propertyIds={properties.map((p) => p.id)} />
              <ComparisonRow
                label="Completion"
                values={properties.map((p) => `${completionMap.get(p.id) || 0}%`)}
                propertyIds={properties.map((p) => p.id)}
              />
              <ComparisonRow
                label="Documents"
                values={properties.map((p) => (documentCounts.get(p.id) || 0).toString())}
                propertyIds={properties.map((p) => p.id)}
              />
              <ComparisonRow
                label="Media"
                values={properties.map((p) => (mediaCounts.get(p.id) || 0).toString())}
                propertyIds={properties.map((p) => p.id)}
              />
              <ComparisonRow
                label="Status"
                values={properties.map((p) => p.status)}
                propertyIds={properties.map((p) => p.id)}
              />
              <ComparisonRow
                label="Public"
                values={properties.map((p) => (p.public_visibility ? 'Yes' : 'No'))}
                propertyIds={properties.map((p) => p.id)}
              />
              <ComparisonRow
                label="Created"
                values={properties.map((p) =>
                  new Date(p.created_at).toLocaleDateString('en-GB')
                )}
                propertyIds={properties.map((p) => p.id)}
              />
              {restrictedIds.map((restrictedId) => (
                <tr key={restrictedId} className="border-b bg-muted/30" data-testid={`compare-row-restricted-${restrictedId}`}>
                  <td className="p-4 font-medium" colSpan={properties.length + 1}>
                    Limited access: property {restrictedId} could not be compared because viewing is restricted.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AppSection>

      <AppSection title="Property Details">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} data-testid={`compare-card-${property.id}`}>
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

function ComparisonRow({
  label,
  values,
  propertyIds,
}: {
  label: string;
  values: string[];
  propertyIds: string[];
}) {
  const labelKey = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <tr className="border-b" data-testid={`compare-row-${labelKey}`}>
      <td className="p-4 font-medium" data-testid={`compare-cell-${labelKey}-label`}>
        {label}
      </td>
      {values.map((value, idx) => (
        <td key={idx} className="p-4" data-testid={`compare-cell-${labelKey}-${propertyIds[idx]}`}>
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

