import { use } from 'react';
import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { TimelineList } from '@/components/events/TimelineList';
import { getEventsForProperty } from '@/actions/events';

interface PropertyHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyHistoryPage({ params }: PropertyHistoryPageProps) {
  const { id } = use(params);
  const supabase = await createServerClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (propertyError || !property) {
    notFound();
  }

  const events = await getEventsForProperty(id);

  return (
    <div className="space-y-6" data-testid="property-history-page">
      <AppSection
        id="events-timeline"
        title="Events timeline"
        description="Chronological record of all property events."
      >
        <TimelineList items={events} />
      </AppSection>
    </div>
  );
}
