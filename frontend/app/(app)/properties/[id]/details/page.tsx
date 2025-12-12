import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { PropertyKeyFacts } from '@/components/property/property-key-facts';
import { PropertyMetaSection } from '@/components/property/property-meta-section';
import type { Database } from '@/types/supabase';

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (propertyError || !property) {
    notFound();
  }

  const propertyTyped = property as Database['public']['Tables']['properties']['Row'];

  // Fetch property metadata
  const { data: metadata } = await supabase
    .from('property_metadata')
    .select('*')
    .eq('property_id', id)
    .order('meta_key', { ascending: true });

  return (
    <div className="space-y-6" data-testid="property-details-loaded">
      <AppSection
        id="key-facts"
        title="Key facts"
        description="Core facts and external data (EPC, flood, planning, title)."
      >
        <PropertyKeyFacts property={propertyTyped} />
      </AppSection>

      <AppSection
        id="property-info"
        title="Property information"
        description="Address, UPRN, coordinates and status."
      >
        <PropertyMetaSection property={propertyTyped} />
      </AppSection>

      <AppSection
        id="metadata"
        title="Additional metadata"
        description="Extended property data and attributes."
      >
        <PropertyMetadataTable metadata={metadata || []} />
      </AppSection>
    </div>
  );
}

type MetadataRow = Database['public']['Tables']['property_metadata']['Row'];

function PropertyMetadataTable({ metadata }: { metadata: MetadataRow[] }) {
  if (metadata.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No additional metadata available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="property-metadata-table">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody>
            {metadata.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{formatMetaKey(item.meta_key)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatMetaValue(item.meta_value)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(item.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMetaKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMetaValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
