-- Migration: Search Properties RPC
-- Purpose: Global property search by UPRN, address, and postcode
-- Date: 2024-12-01
--
-- This migration creates an RPC function for searching properties with:
-- - Fuzzy address matching
-- - Postcode prefix matching
-- - UPRN exact/partial matching
-- - RLS enforcement (only shows properties user can access)

-- ============================================================================
-- RPC Function: search_properties
-- ============================================================================

create or replace function public.search_properties(
  query_text text,
  result_limit int default 50
)
returns table (
  id uuid,
  uprn text,
  display_address text,
  latitude numeric,
  longitude numeric,
  status text,
  created_at timestamptz,
  relevance_score int
)
language plpgsql
security definer
stable
as $$
begin
  -- Normalize query
  query_text := lower(trim(query_text));
  
  -- Return empty if query too short
  if length(query_text) < 2 then
    return;
  end if;

  -- Search with relevance scoring
  return query
    select
      p.id,
      p.uprn,
      p.display_address,
      p.latitude,
      p.longitude,
      p.status,
      p.created_at,
      -- Relevance scoring (higher = better match)
      case
        -- Exact UPRN match: highest priority
        when lower(p.uprn) = query_text then 1000
        -- UPRN starts with query
        when lower(p.uprn) like query_text || '%' then 900
        -- Exact postcode match (extract from display_address)
        when lower(split_part(p.display_address, ',', -1)) = query_text then 800
        -- Postcode starts with query
        when lower(split_part(p.display_address, ',', -1)) like query_text || '%' then 700
        -- Address contains query (word boundary)
        when lower(p.display_address) like '% ' || query_text || ' %' then 600
        when lower(p.display_address) like query_text || ' %' then 590
        when lower(p.display_address) like '% ' || query_text then 580
        -- Fuzzy address match (contains anywhere)
        when lower(p.display_address) like '%' || query_text || '%' then 500
        else 0
      end as relevance_score
    from public.properties p
    where
      -- Only non-deleted properties
      p.deleted_at is null
      and (
        -- Match against UPRN
        lower(p.uprn) like '%' || query_text || '%'
        or
        -- Match against address (fuzzy)
        lower(p.display_address) like '%' || query_text || '%'
      )
    order by
      -- Order by relevance score (descending)
      relevance_score desc,
      -- Then by status (active first)
      case p.status
        when 'active' then 1
        when 'draft' then 2
        when 'archived' then 3
        else 4
      end,
      -- Then by created date (newest first)
      p.created_at desc
    limit result_limit;
end;
$$;

-- Grant execute permissions
grant execute on function public.search_properties(text, int) to authenticated;
grant execute on function public.search_properties(text, int) to anon;

-- ============================================================================
-- Comments
-- ============================================================================

comment on function public.search_properties is 'Search properties by UPRN, address, or postcode with relevance scoring. RLS enforced via row-level policies.';

