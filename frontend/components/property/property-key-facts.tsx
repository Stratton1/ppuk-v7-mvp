import type { Database } from '@/types/supabase';
import { EpcCard } from '@/components/property/cards/epc-card';
import { FloodCard } from '@/components/property/cards/flood-card';
import { PlanningCard } from '@/components/property/cards/planning-card';
import { TitleCard } from '@/components/property/cards/title-card';
import { getPropertyFacts } from '@/lib/property-facts';

type Property = Database['public']['Tables']['properties']['Row'];

export async function PropertyKeyFacts({ property }: { property: Property }) {
  const facts = await getPropertyFacts(property.id);

  return (
    <div className="grid gap-4 md:grid-cols-2" data-testid="key-facts-loaded">
      <EpcCard data={facts.epc.data} loading={facts.epc.loading} error={facts.epc.error} />
      <FloodCard data={facts.flood.data} loading={facts.flood.loading} error={facts.flood.error} />
      <PlanningCard
        data={facts.planning.data}
        loading={facts.planning.loading}
        error={facts.planning.error}
      />
      <TitleCard data={facts.title.data} loading={facts.title.loading} error={facts.title.error} />
    </div>
  );
}
