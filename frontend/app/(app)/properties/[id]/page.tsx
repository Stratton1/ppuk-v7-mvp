import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, Image as ImageIcon, Home } from 'lucide-react';
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
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { docRowToUidDocument, type UidDocument } from '@/lib/documents/types';
import { mediaRowToUidMedia, type UidMedia } from '@/lib/media/types';
import { propertyRowToSearchResult, type SearchResult } from '@/lib/search/types';
import type { Database } from '@/types/supabase';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params);
  const supabase = await createServerClient();

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

  const mediaPreview: UidMedia[] = allMedia ? await Promise.all(allMedia.slice(0, 6).map((row) => mediaRowToUidMedia(row))) : [];
  const documentPreview: UidDocument[] =
    documents ? await Promise.all(documents.slice(0, 3).map((row) => docRowToUidDocument(row))) : [];

  // Related properties (simple recency, excluding current)
  const { data: relatedRows } = await supabase
    .from('properties')
    .select('*')
    .neq('id', id)
    .order('updated_at', { ascending: false })
    .limit(3);
  const related: SearchResult[] = relatedRows ? relatedRows.map((row) => propertyRowToSearchResult(row)) : [];

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
          <p className="text-sm font-medium text-foreground">Key documents</p>
          {documentPreview.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-5 w-5" />}
              title="No documents yet"
              description="Upload documents to build your passport."
              variant="muted"
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href={`/properties/${propertyTyped.id}/documents/upload`}>
                    Upload document
                  </Link>
                </Button>
              }
            />
          ) : (
            documentPreview.map((doc) => <DocumentCard key={doc.id} document={doc} />)
          )}
        </div>
        <div className="space-y-3" data-testid="property-overview-media-preview">
          <p className="text-sm font-medium text-foreground">Recent media</p>
          {mediaPreview.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="h-5 w-5" />}
              title="No media yet"
              description="Add photos to showcase your property."
              variant="muted"
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href={`/properties/${propertyTyped.id}/media/upload`}>
                    Upload photo
                  </Link>
                </Button>
              }
            />
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
        dataTestId="related-properties-section"
      >
        {related.length === 0 ? (
          <EmptyState
            icon={<Home className="h-5 w-5" />}
            title="No related properties"
            description="Related properties will appear here."
            variant="muted"
            dataTestId="related-properties-empty"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="related-properties">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/properties/${item.id}`}
                className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
                data-testid={`related-properties-${item.id}`}
              >
                <p className="text-sm font-medium leading-snug text-foreground">
                  {item.address}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {new Date(item.updatedAt).toLocaleDateString('en-GB')}
                </p>
              </Link>
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
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No documents yet"
            description="View all in the Documents tab or upload new documents."
            variant="muted"
            action={
              <Button asChild variant="outline" size="sm">
                <Link href={`/properties/${propertyTyped.id}/documents`}>
                  Go to Documents
                </Link>
              </Button>
            }
          />
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
