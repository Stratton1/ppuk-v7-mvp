import Link from 'next/link';
import { Search, Building2, Calendar, AlertCircle, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/lib/search/types';

type SearchResultsProps = {
  results: SearchResult[];
};

export function SearchResults({ results }: SearchResultsProps) {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">No properties found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search criteria or broadening your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {results.map((result) => (
        <Link key={result.id} href={`/properties/${result.id}`} data-testid={`search-result-card-${result.id}`}>
          <Card className="transition-colors hover:border-primary/50">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium leading-snug text-foreground">{result.address}</p>
                  <Badge variant="secondary" className="shrink-0">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(result.updatedAt).toLocaleDateString('en-GB')}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
                    <Zap className="h-3 w-3" />
                    {result.epcRating ? `EPC ${result.epcRating}` : 'EPC n/a'}
                  </span>
                  <span className="text-border">•</span>
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Issues: {result.flaggedIssueCount ?? 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
