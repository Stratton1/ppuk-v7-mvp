import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { PropertyOverviewCard } from '@/components/property/property-overview-card';
import { PropertyKeyFacts } from '@/components/property/property-key-facts';
import { PropertyTimelineSection } from '@/components/property/property-timeline-section';
import { PropertyStakeholdersSection } from '@/components/property/property-stakeholders-section';
import { PropertyFlagsSection } from '@/components/property/property-flags-section';
import { PropertyTasksSection } from '@/components/property/property-tasks-section';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentList } from '@/components/documents/DocumentList';
import { MediaGrid } from '@/components/media/MediaGrid';
import { docRowToUidDocument, type UidDocument } from '@/lib/documents/types';
import { mediaRowToUidMedia, type UidMedia } from '@/lib/media/types';
import { propertyRowToSearchResult, type SearchResult } from '@/lib/search/types';
import type { Database } from '@/types/supabase';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
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

  // Type assertion needed due to RLS type inference issue
  const propertyTyped = property as Database['public']['Tables']['properties']['Row'];

  const [{ data: allMedia }, { data: tasks }, { data: documents }] = await Promise.all([
    supabase
      .from('media')
      .select('*')
      .eq('property_id', propertyTyped.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('tasks')
      .select('*')
      .eq('property_id', propertyTyped.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('property_id', propertyTyped.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const mediaPreview: UidMedia[] = allMedia ? await Promise.all(allMedia.slice(0, 6).map((row) => mediaRowToUidMedia(row as any))) : [];
  const documentPreview: UidDocument[] = documents ? await Promise.all(documents.slice(0, 3).map((row) => docRowToUidDocument(row as any))) : [];

  // Related properties (simple recency, excluding current)
  const { data: relatedRows } = await supabase
    .from('properties')
    .select('*')
    .neq('id', id)
    .order('updated_at', { ascending: false })
    .limit(3);
  const related: SearchResult[] = relatedRows ? relatedRows.map((row) => propertyRowToSearchResult(row as any)) : [];

  return (
    <div className="space-y-6" data-testid="property-loaded">
      <AppSection
        id="overview"
        title="Overview"
        description="High-level summary of this property passport."
      >
      <PropertyOverviewCard property={propertyTyped} media={allMedia || []} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3" data-testid="property-overview-key-docs">
          <p className="text-sm font-medium">Key documents</p>
          {documentPreview.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          ) : (
            documentPreview.map((doc) => <DocumentCard key={doc.id} document={doc} />)
          )}
        </div>
        <div className="space-y-3" data-testid="property-overview-media-preview">
          <p className="text-sm font-medium">Recent media</p>
          {mediaPreview.length === 0 ? (
            <p className="text-sm text-muted-foreground">No media yet.</p>
          ) : (
            <MediaGrid media={mediaPreview.slice(0, 3)} />
          )}
        </div>
        </div>
      </AppSection>

      <AppSection
        id="related-properties"
        title="Related properties"
        description="Other recently updated properties."
        data-testid="related-properties-section"
      >
        {related.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="related-properties-empty">
            No related properties available.
          </p>
        ) : (
          <div className="space-y-3" data-testid="related-properties">
            {related.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-3" data-testid={`related-properties-${item.id}`}>
                <p className="text-sm font-medium">{item.address}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(item.updatedAt).toLocaleDateString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        )}
      </AppSection>

      <AppSection
        id="key-facts"
        title="Key facts"
        description="Core facts and external data (EPC, flood, planning, title)."
      >
        <PropertyKeyFacts property={propertyTyped} />
      </AppSection>

      <AppSection
        id="documents"
        title="Documents"
        description="Surveys, certificates, legal documents and more."
      >
        {documentPreview.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents yet. View all in the Documents tab.</p>
        ) : (
          <DocumentList documents={documentPreview} />
        )}
      </AppSection>

      <AppSection
        id="timeline"
        title="Timeline"
        description="Key events and milestones for this property."
      >
        <PropertyTimelineSection propertyId={propertyTyped.id} />
      </AppSection>

      <AppSection
        id="stakeholders"
        title="Stakeholders & access"
        description="Who can see and edit this passport."
      >
        <PropertyStakeholdersSection propertyId={propertyTyped.id} />
      </AppSection>

      <AppSection
        id="flags"
        title="Flags"
        description="Issues to resolve for this property."
      >
        <PropertyFlagsSection propertyId={propertyTyped.id} tasks={tasks || []} />
      </AppSection>

      <AppSection
        id="tasks"
        title="Tasks"
        description="Actions and reminders to complete."
      >
        <PropertyTasksSection propertyId={propertyTyped.id} tasks={tasks || []} />
      </AppSection>
    </div>
  );
}
