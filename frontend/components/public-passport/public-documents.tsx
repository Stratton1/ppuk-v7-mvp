import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PublicDocumentsProps = {
  documents: Array<{ name: string; url: string }>;
};

export const PublicDocuments = ({ documents }: PublicDocumentsProps) => {
  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">No public documents available.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Public Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {documents.map((doc, idx) => (
          <div key={`${doc.name}-${idx}`} className="flex items-center justify-between rounded-md border p-2">
            <span>{doc.name}</span>
            <Link href={doc.url} target="_blank" className="text-primary hover:underline">
              View
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
