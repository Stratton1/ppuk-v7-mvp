import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDocumentUrl } from '@/lib/signed-url';
import {
  getDocumentTypeLabel,
  getDocumentTypeIcon,
  getDocumentStatusVariant,
  formatFileSize,
  formatMimeType,
} from '@/lib/document-utils';
import { UploadDocumentDialog } from './upload-document-dialog';
import { DeleteDocumentDialog } from './delete-document-dialog';

type PropertyDocument = Database['public']['Tables']['documents']['Row'];

type PropertyDocumentsProps = {
  propertyId: string;
};

export async function PropertyDocuments({ propertyId }: PropertyDocumentsProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const hasPropertyRoleArgs: Database['public']['Functions']['has_property_role']['Args'] = {
    property_id: propertyId,
    allowed_roles: ['owner', 'editor'],
  };
  const { data: canDelete } = await supabase.rpc('has_property_role', hasPropertyRoleArgs);

  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('*')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const uploaderMap: Map<string, { full_name: string | null; primary_role?: string | null }> = new Map();

  if (documents && documents.length > 0) {
    const uploaderIds = [...new Set(documents.map((d) => d.uploaded_by_user_id))];
    const { data: uploaders } = await supabase
      .from('users')
      .select('id, full_name, primary_role')
      .in('id', uploaderIds);

    uploaders?.forEach((u) => {
      uploaderMap.set(u.id, {
        full_name: u.full_name,
        primary_role: u.primary_role ?? null,
      });
    });
  }

  if (documentsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load documents: {documentsError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Documents</CardTitle>
            <UploadDocumentDialog propertyId={propertyId} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No documents available for this property.</p>
          <p className="mt-2 text-xs text-muted-foreground">Documents are filtered based on your access permissions.</p>
        </CardContent>
      </Card>
    );
  }

  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const signedUrl = await getDocumentUrl(doc.storage_path);
      const uploader = uploaderMap.get(doc.uploaded_by_user_id);
      return { ...doc, signedUrl, uploader };
    })
  );

  const groupedDocumentsWithUrls = documentsWithUrls.reduce((acc, doc) => {
    const type = doc.document_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, Array<PropertyDocument & { signedUrl: string | null; uploader?: { full_name: string | null; primary_role?: string | null } }>>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} available
            </p>
          </div>
          <UploadDocumentDialog propertyId={propertyId} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedDocumentsWithUrls).map(([type, docs]) => {
          const documentType = type as PropertyDocument['document_type'];
          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getDocumentTypeIcon(documentType)}</span>
                <h3 className="font-semibold">{getDocumentTypeLabel(documentType)}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {docs.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-medium">{doc.title}</p>
                        <Badge variant={getDocumentStatusVariant(doc.status)} className="text-xs">
                          {doc.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono">{formatMimeType(doc.mime_type)}</span>
                        <span>{formatFileSize(doc.size_bytes)}</span>
                        {doc.version > 1 && <span>v{doc.version}</span>}
                        {doc.uploader && (
                          <span>
                            by {doc.uploader.full_name}
                            {doc.uploader.primary_role && (
                              <span className="capitalize"> ({doc.uploader.primary_role})</span>
                            )}
                          </span>
                        )}
                        <span>
                          {new Date(doc.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.signedUrl ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={doc.signedUrl} download target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Unavailable
                        </Button>
                      )}

                      {canDelete && (
                        <DeleteDocumentDialog
                          documentId={doc.id}
                          propertyId={propertyId}
                          documentTitle={doc.title}
                          documentType={doc.document_type}
                          fileName={doc.storage_path.split('/').pop()}
                          fileSize={doc.size_bytes}
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                            <span className="sr-only">Delete document</span>
                          </Button>
                        </DeleteDocumentDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
