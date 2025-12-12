import { use } from 'react';
import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploadForm } from '@/components/documents/DocumentUploadForm';
import { docRowToUidDocument, type UidDocument } from '@/lib/documents/types';
import { createDocumentAction, deleteDocumentAction } from '@/actions/documents';
import { canUploadDocuments } from '@/lib/permissions/documents';
import { TimelineList } from '@/components/events/TimelineList';
import { getEventsForProperty } from '@/actions/events';

type PropertyDocumentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDocumentsPage({ params }: PropertyDocumentsPageProps) {
  const { id } = use(params);
  const supabase = await createServerClient();

  const { data: property } = await supabase.from('properties').select('id').eq('id', id).maybeSingle();
  if (!property) notFound();

  const { data: documentRows } = await supabase
    .from('documents')
    .select('*')
    .eq('property_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const documents: UidDocument[] = documentRows
    ? await Promise.all(
        documentRows.map((row) => docRowToUidDocument(row as Database['public']['Tables']['documents']['Row']))
      )
    : [];
  const canUpload = await canUploadDocuments(id);
  const events = await getEventsForProperty(id);

  return (
    <div className="space-y-6" data-testid="property-documents-page">
      <AppPageHeader title="Documents" description="Manage Property Passport documents and evidence." />

      {canUpload && (
        <AppSection title="Upload document" description="Add a new document to this property.">
          <DocumentUploadForm propertyId={id} action={createDocumentAction} />
        </AppSection>
      )}

      <AppSection title="All documents" description="Categorised documents for this property." data-testid="doc-list-section">
        {documents.length === 0 ? (
          <DocumentList documents={documents} />
        ) : (
          <div className="space-y-3" data-testid="doc-list">
            {documents.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <DocumentCard document={doc} />
                {canUpload && (
                  <form
                    action={async () => {
                      'use server';
                      await deleteDocumentAction(doc.id, id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs text-destructive underline"
                      data-testid={`doc-delete-button-${doc.id}`}
                    >
                      Delete
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </AppSection>

      <AppSection title="Document events" description="Recent document activity.">
        <TimelineList items={events.filter((e) => e.type.startsWith('document.'))} />
      </AppSection>
    </div>
  );
}
