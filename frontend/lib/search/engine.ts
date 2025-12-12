import { createClient } from '@/lib/supabase/server';
import { propertyRowToSearchResult, type SearchQuery, type SearchResult } from './types';

export async function runSearch(query: SearchQuery): Promise<SearchResult[]> {
  const supabase = await createClient();
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;
  const page = query.page && query.page > 0 ? query.page : 1;
  const offset = (page - 1) * pageSize;

  // Basic text search using search_properties RPC if available
  const filters = query.filters ?? {};
  const text = query.text?.trim() ?? '';

  let rows: any[] = [];
  try {
    if (text.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .rpc('search_properties', {
          query_text: text,
          result_limit: pageSize,
          result_offset: offset,
        })
        .catch(() => ({ data: [] }));
      rows = data || [];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('properties')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      rows = data || [];
    }
  } catch (error) {
    console.error('runSearch error', error);
    rows = [];
  }

  // UI-side filtering
  const filtered = rows.filter((row) => {
    if (filters.bedrooms && (row.bedrooms ?? 0) < filters.bedrooms) return false;
    if (filters.bathrooms && (row.bathrooms ?? 0) < filters.bathrooms) return false;
    if (filters.propertyType && row.property_type && row.property_type !== filters.propertyType) return false;
    if (filters.tenure && row.tenure && row.tenure !== filters.tenure) return false;
    if (filters.minPrice && (row.price ?? 0) < filters.minPrice) return false;
    if (filters.maxPrice && (row.price ?? 0) > filters.maxPrice) return false;
    if (filters.minEPC && row.epc_rating && row.epc_rating < filters.minEPC) return false;
    if (filters.maxEPC && row.epc_rating && row.epc_rating > filters.maxEPC) return false;
    if (filters.hasDocuments && !(row as { documents_count?: number }).documents_count) return false;
    if (filters.hasMedia && !(row as { media_count?: number }).media_count) return false;
    if (filters.hasIssues && !(row as { flagged_issue_count?: number }).flagged_issue_count) return false;
    return true;
  });

  // Role-aware: owners see their properties, buyer limited to viewable, admin sees all
  const role = query.role;
  let results = filtered;
  if (role === 'buyer' && query.userId) {
    results = filtered.filter((row) => row.created_by_user_id === query.userId || row.public_visibility === true);
  }

  const mapped = await Promise.all(results.map((row) => propertyRowToSearchResult(row)));
  return mapped;
}
