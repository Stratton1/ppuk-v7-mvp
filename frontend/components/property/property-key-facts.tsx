import type { Database } from '@/types/supabase';
import { EpcCard } from '@/components/property/cards/epc-card';
import { FloodCard } from '@/components/property/cards/flood-card';
import { PlanningCard } from '@/components/property/cards/planning-card';
import { TitleCard } from '@/components/property/cards/title-card';
import { getEpcDataForProperty, getFloodDataForProperty, getPlanningDataForProperty, getTitleDataForProperty } from '@/lib/property-facts';

type Property = Database['public']['Tables']['properties']['Row'];

export function PropertyKeyFacts({ property }: { property: Property }) {
  const epc = getEpcDataForProperty(property.uprn);
  const flood = getFloodDataForProperty(property.uprn);
  const planning = getPlanningDataForProperty(property.uprn);
  const title = getTitleDataForProperty(property.uprn);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <EpcCard data={epc?.data ?? null} loading={epc?.loading ?? false} error={epc?.error} />
      <FloodCard data={flood?.data ?? null} loading={flood?.loading ?? false} error={flood?.error} />
      <PlanningCard data={planning?.data ?? null} loading={planning?.loading ?? false} error={planning?.error} />
      <TitleCard data={title?.data ?? null} loading={title?.loading ?? false} error={title?.error} />
    </div>
  );
}
