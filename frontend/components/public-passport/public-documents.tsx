import Link from 'next/link';
import { FileText, FolderOpen } from 'lucide-react';

type PublicDocumentsProps = {
  documents: Array<{ name: string; url: string }>;
};

export const PublicDocuments = ({ documents }: PublicDocumentsProps) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Public Documents</h2>
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-foreground">No documents available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This property passport has no public documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">Public Documents</h2>
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <Link
            key={`${doc.name}-${idx}`}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">{doc.name}</span>
            </div>
            <span className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
