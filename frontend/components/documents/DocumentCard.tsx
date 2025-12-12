import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { documentCategoryLabel, type UidDocument } from '@/lib/documents/types';

type DocumentCardProps = {
  document: UidDocument;
};

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Card data-testid={`doc-card-${document.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">{document.name}</CardTitle>
          <Badge variant="secondary" data-testid="doc-category">
            {documentCategoryLabel(document.category)}
          </Badge>
        </div>
        {document.size && (
          <span className="text-xs text-muted-foreground">{formatSize(document.size)}</span>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>{document.mimeType}</span>
          <span>•</span>
          <span>{new Date(document.uploadedAt).toLocaleDateString('en-GB')}</span>
          {document.uploadedBy && (
            <>
              <span>•</span>
              <span>by {document.uploadedBy}</span>
            </>
          )}
        </div>
        {document.url ? (
          <a
            className="text-primary underline"
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View / download
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
