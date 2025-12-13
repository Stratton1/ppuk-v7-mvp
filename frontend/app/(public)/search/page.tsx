import { Suspense, use } from 'react';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { SavedSearchList } from '@/components/search/SavedSearchList';
import SaveCurrentSearch from './save-current-search';
import { runSearch } from '@/lib/search/engine';
import type { SearchQuery } from '@/lib/search/types';
import { getServerUser } from '@/lib/auth/server-user';
import type { DashboardRole } from '@/lib/roles/domain';

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = use(searchParams);
  const text = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const page = typeof resolvedSearchParams.page === 'string' ? Number(resolvedSearchParams.page) : 1;
  const filters = buildFilters(resolvedSearchParams);
  const user = await getServerUser();
  const role: DashboardRole = user?.isAdmin
    ? 'admin'
    : user?.primary_role === 'agent'
    ? 'agent'
    : user?.primary_role === 'conveyancer'
    ? 'conveyancer'
    : user && Object.values(user.property_roles || {}).some((r) => r.status.includes('owner'))
    ? 'owner'
    : 'buyer';
  const query: SearchQuery = { text, page, filters, role, userId: user?.id ?? null };
  const results = await runSearch(query);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <AppPageHeader
        title="Search Properties"
        description="Search by address, postcode, or UPRN with filters."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
      />

      <AppSection title="Filters" description="Refine results by attributes.">
        <form action="/search" className="space-y-4">
          <input
            type="search"
            name="q"
            defaultValue={text}
            placeholder="Search address, postcode, or UPRN"
            className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
            data-testid="search-page-input"
          />
        </form>
        <SearchFilters />
      </AppSection>

      <AppSection title="Results" description="Matching properties.">
        <SearchResults results={results} />
      </AppSection>

      <AppSection title="Saved searches" description="Local saved searches (device-only).">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading saved searches…</div>}>
          <div className="space-y-4">
            <SaveCurrentSearch query={query} />
            <SavedSearchList />
          </div>
        </Suspense>
      </AppSection>
    </div>
  );
}

function buildFilters(searchParams: Record<string, string | string[] | undefined>) {
  const get = (key: string) => (typeof searchParams[key] === 'string' ? (searchParams[key] as string) : undefined);
  return {
    bedrooms: get('bedrooms') ? Number(get('bedrooms')) : undefined,
    bathrooms: get('bathrooms') ? Number(get('bathrooms')) : undefined,
    propertyType: get('propertyType') ?? undefined,
    tenure: get('tenure') ?? undefined,
    minPrice: get('minPrice') ? Number(get('minPrice')) : undefined,
    maxPrice: get('maxPrice') ? Number(get('maxPrice')) : undefined,
    minEPC: get('minEPC') ?? undefined,
    maxEPC: get('maxEPC') ?? undefined,
    hasDocuments: get('hasDocuments') === 'true' ? true : undefined,
    hasMedia: get('hasMedia') === 'true' ? true : undefined,
    hasIssues: get('hasIssues') === 'true' ? true : undefined,
  };
}
