import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import { propertyRowToSearchResult, type SearchQuery, type SearchResult } from './types';

export async function runSearch(query: SearchQuery): Promise<SearchResult[]> {
  const supabase = await createClient();
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 20;
  const page = query.page && query.page > 0 ? query.page : 1;
  const offset = (page - 1) * pageSize;

  // Basic text search using search_properties RPC if available
  const filters = query.filters ?? {};
  const text = query.text?.trim() ?? '';

  type PropertyRow = Database['public']['Tables']['properties']['Row'];
  let rows: PropertyRow[] = [];
  try {
    if (text.length > 0) {
      const { data } =
        (await supabase.rpc('search_properties', {
          query_text: text,
          result_limit: pageSize,
          result_offset: offset,
        })) ?? {};
      rows = (data as PropertyRow[] | null) || [];
    } else {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      rows = (data as PropertyRow[] | null) || [];
    }
  } catch (error) {
    console.error('runSearch error', error);
    rows = [];
  }

  // UI-side filtering
  // Note: Extended property fields may come from RPC results or future schema additions
  type ExtendedRow = PropertyRow & {
    bedrooms?: number | null;
    bathrooms?: number | null;
    property_type?: string | null;
    tenure?: string | null;
    price?: number | null;
    epc_rating?: string | null;
    documents_count?: number;
    media_count?: number;
    flagged_issue_count?: number;
  };
  const filtered = rows.filter((row) => {
    const r = row as ExtendedRow;
    if (filters.bedrooms && (r.bedrooms ?? 0) < filters.bedrooms) return false;
    if (filters.bathrooms && (r.bathrooms ?? 0) < filters.bathrooms) return false;
    if (filters.propertyType && r.property_type && r.property_type !== filters.propertyType) return false;
    if (filters.tenure && r.tenure && r.tenure !== filters.tenure) return false;
    if (filters.minPrice && (r.price ?? 0) < filters.minPrice) return false;
    if (filters.maxPrice && (r.price ?? 0) > filters.maxPrice) return false;
    if (filters.minEPC && r.epc_rating && r.epc_rating < filters.minEPC) return false;
    if (filters.maxEPC && r.epc_rating && r.epc_rating > filters.maxEPC) return false;
    if (filters.hasDocuments && !r.documents_count) return false;
    if (filters.hasMedia && !r.media_count) return false;
    if (filters.hasIssues && !r.flagged_issue_count) return false;
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
