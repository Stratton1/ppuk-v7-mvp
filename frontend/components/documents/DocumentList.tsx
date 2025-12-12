import { DocumentCard } from '@/components/documents/DocumentCard';
import type { UidDocument } from '@/lib/documents/types';

type DocumentListProps = {
  documents: UidDocument[];
};

export function DocumentList({ documents }: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        data-testid="doc-empty-state"
      >
        No documents found.
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="doc-list">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
