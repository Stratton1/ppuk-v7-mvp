import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { PropertyOverviewCard } from '@/components/property/property-overview-card';
import { PropertyKeyFacts } from '@/components/property/property-key-facts';
import { PropertyDocumentsSection } from '@/components/property/property-documents-section';
import { PropertyTimelineSection } from '@/components/property/property-timeline-section';
import { PropertyStakeholdersSection } from '@/components/property/property-stakeholders-section';
import { PropertyFlagsSection } from '@/components/property/property-flags-section';
import { PropertyTasksSection } from '@/components/property/property-tasks-section';
import type { Database } from '@/types/supabase';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const supabase = createServerClient();

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single();

  if (propertyError || !property) {
    notFound();
  }

  // Type assertion needed due to RLS type inference issue
  const propertyTyped = property as Database['public']['Tables']['properties']['Row'];

  const [{ data: allMedia }, { data: tasks }] = await Promise.all([
    supabase
      .from('media')
      .select('*')
      .eq('property_id', propertyTyped.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('tasks')
      .select('*')
      .eq('property_id', propertyTyped.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="space-y-6" data-testid="property-loaded">
      <AppSection
        id="overview"
        title="Overview"
        description="High-level summary of this property passport."
      >
        <PropertyOverviewCard property={propertyTyped} media={allMedia || []} />
      </AppSection>

      <AppSection
        id="key-facts"
        title="Key facts"
        description="Core facts and external data (EPC, flood, planning, title)."
      >
        <PropertyKeyFacts property={propertyTyped} />
      </AppSection>

      <AppSection
        id="documents"
        title="Documents"
        description="Surveys, certificates, legal documents and more."
      >
        <PropertyDocumentsSection propertyId={propertyTyped.id} />
      </AppSection>

      <AppSection
        id="timeline"
        title="Timeline"
        description="Key events and milestones for this property."
      >
        <PropertyTimelineSection propertyId={propertyTyped.id} />
      </AppSection>

      <AppSection
        id="stakeholders"
        title="Stakeholders & access"
        description="Who can see and edit this passport."
      >
        <PropertyStakeholdersSection propertyId={propertyTyped.id} />
      </AppSection>

      <AppSection
        id="flags"
        title="Flags & tasks"
        description="Issues to resolve and tasks to complete."
      >
        <div className="space-y-6">
          <PropertyFlagsSection propertyId={propertyTyped.id} tasks={tasks || []} />
          <PropertyTasksSection propertyId={propertyTyped.id} tasks={tasks || []} />
        </div>
      </AppSection>
    </div>
  );
}
