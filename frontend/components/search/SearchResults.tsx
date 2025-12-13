import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/lib/search/types';

type SearchResultsProps = {
  results: SearchResult[];
};

export function SearchResults({ results }: SearchResultsProps) {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No results found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {results.map((result) => (
        <Link key={result.id} href={`/properties/${result.id}`} data-testid={`search-result-card-${result.id}`}>
          <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium leading-snug text-foreground">{result.address}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {new Date(result.updatedAt).toLocaleDateString('en-GB')}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-muted px-2 py-0.5">
                    {result.epcRating ? `EPC ${result.epcRating}` : 'EPC n/a'}
                  </span>
                  <span className="text-border">•</span>
                  <span>Issues: {result.flaggedIssueCount ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
