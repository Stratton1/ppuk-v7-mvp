import Link from 'next/link';
import { FileText } from 'lucide-react';

type PublicDocumentsProps = {
  documents: Array<{ name: string; url: string }>;
};

export const PublicDocuments = ({ documents }: PublicDocumentsProps) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 text-center text-sm text-muted-foreground shadow-sm">
        No public documents available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-primary">Public Documents</h2>
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <Link
            key={`${doc.name}-${idx}`}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-glow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">{doc.name}</span>
            </div>
            <span className="text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
