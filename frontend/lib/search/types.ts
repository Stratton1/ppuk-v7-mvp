import type { DashboardRole } from '@/lib/roles/domain';
import type { Database } from '@/types/supabase';

export type FilterSet = {
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: string | null;
  tenure?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minEPC?: string | null;
  maxEPC?: string | null;
  hasDocuments?: boolean | null;
  hasMedia?: boolean | null;
  hasIssues?: boolean | null;
};

export type SearchQuery = {
  text?: string;
  page?: number;
  pageSize?: number;
  filters?: FilterSet;
  role?: DashboardRole;
  userId?: string | null;
};

export type SearchResult = {
  id: string;
  address: string;
  slug: string | null;
  imageUrl?: string | null;
  completion?: number | null;
  epcRating?: string | null;
  flaggedIssueCount?: number | null;
  updatedAt: string;
};

type PropertyRow = Database['public']['Tables']['properties']['Row'];

export function propertyRowToSearchResult(row: PropertyRow & Record<string, unknown>): SearchResult {
  // Some fields like completion/epc may be added via joins; use safe lookups
  const completion = (row as { completion?: number }).completion ?? null;
  const epc = (row as { epc_rating?: string }).epc_rating ?? null;
  const flaggedIssueCount = (row as { flagged_issue_count?: number }).flagged_issue_count ?? null;
  const imageUrl = (row as { image_url?: string }).image_url ?? null;

  return {
    id: row.id,
    address: row.display_address ?? 'Unknown address',
    slug: row.public_slug ?? null,
    imageUrl,
    completion,
    epcRating: epc,
    flaggedIssueCount,
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
}
