/**
 * File: search/page.tsx
 * Purpose: Global property search page
 * Type: Server Component
 */

import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  type SearchResult = Database['public']['Functions']['search_properties']['Returns'][number];
  let results: SearchResult[] = [];
  let error: string | null = null;

  if (query && query.length >= 2) {
    try {
      const searchArgs: Database['public']['Functions']['search_properties']['Args'] = {
        query_text: query,
        result_limit: 50,
      };
      const { data, error: searchError } = await supabase.rpc('search_properties', searchArgs);

      if (searchError) {
        error = searchError.message;
      } else {
        results = data || [];
      }
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Search failed';
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Search Properties</h1>
          <p className="text-muted-foreground">
            Search by address, postcode, or UPRN
          </p>
        </div>

        {/* Search Form */}
        <form action="/search" method="get" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="search"
              name="q"
              placeholder="e.g., Elgin Avenue, W9 3QP, or 100023408819"
              defaultValue={query}
              className="flex-1"
              autoFocus
            />
            <Button type="submit">Search</Button>
          </div>
        </form>

        {/* Results */}
        {query && query.length < 2 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Please enter at least 2 characters to search
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-8">
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                Search error: {error}
              </div>
            </CardContent>
          </Card>
        )}

        {query && query.length >= 2 && !error && results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">No properties found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No properties match “{query}”. Try a different search term.
              </p>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {results.length} {results.length === 1 ? 'property' : 'properties'}
            </p>

            <div className="space-y-3">
              {results.map((property) => (
                <PropertySearchResult key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual search result component
 */
async function PropertySearchResult({ property }: { property: Database['public']['Functions']['search_properties']['Returns'][number] }) {
  // Determine status badge variant
  const statusVariant =
    property.status === 'active'
      ? 'default'
      : property.status === 'draft'
      ? 'secondary'
      : 'outline';

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-4">
          {/* Placeholder for thumbnail (future enhancement) */}
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </div>
          </div>

          {/* Property Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight">
                {property.display_address}
              </h3>
              <Badge variant={statusVariant} className="capitalize flex-shrink-0">
                {property.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-mono">UPRN: {property.uprn}</span>
              {property.latitude && property.longitude && (
                <span>
                  {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
