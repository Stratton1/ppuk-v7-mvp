import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/lib/search/types';

type SearchResultsProps = {
  results: SearchResult[];
};

export function SearchResults({ results }: SearchResultsProps) {
  if (!results || results.length === 0) {
    return <div className="text-sm text-muted-foreground">No results.</div>;
  }

  return (
    <div className="grid gap-3">
      {results.map((result) => (
        <Link key={result.id} href={`/properties/${result.id}`} data-testid={`search-result-card-${result.id}`}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="h-16 w-16 rounded bg-muted" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{result.address}</div>
                  <Badge variant="secondary">Updated {new Date(result.updatedAt).toLocaleDateString('en-GB')}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {result.epcRating ? `EPC ${result.epcRating}` : 'EPC n/a'} • Issues:{' '}
                  {result.flaggedIssueCount ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
