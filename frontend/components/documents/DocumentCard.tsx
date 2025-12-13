import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { documentCategoryLabel, type UidDocument } from '@/lib/documents/types';

type DocumentCardProps = {
  document: UidDocument;
};

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card
      className="border-border transition-colors hover:border-primary/50"
      data-testid={`doc-card-${document.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base leading-snug">{document.name}</CardTitle>
          <Badge variant="secondary" data-testid="doc-category">
            {documentCategoryLabel(document.category)}
          </Badge>
        </div>
        {document.size && (
          <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {formatSize(document.size)}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>{document.mimeType}</span>
          <span className="text-border">•</span>
          <span>{new Date(document.uploadedAt).toLocaleDateString('en-GB')}</span>
          {document.uploadedBy && (
            <>
              <span className="text-border">•</span>
              <span>by {document.uploadedBy}</span>
            </>
          )}
        </div>
        {document.url ? (
          <a
            className="inline-flex text-primary transition-colors hover:text-primary/80 hover:underline"
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View / download →
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No download available</span>
        )}
      </CardContent>
    </Card>
  );
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
