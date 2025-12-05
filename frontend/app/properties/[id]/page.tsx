import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { PropertyHeader } from '@/components/property/property-header';
import { PropertyMeta } from '@/components/property/property-meta';
import { PropertyGallery } from '@/components/property/property-gallery';
import { PropertyDocuments } from '@/components/property/property-documents';
import { PropertyAccess } from '@/components/property/property-access';
import { PropertyEvents } from '@/components/property/property-events';
import { PropertyFlags } from '@/components/property/property-flags';
import { CreateTaskDialog } from '@/components/property/tasks/create-task-dialog';
import { createTaskAction } from '@/actions/tasks';
import { AppSection } from '@/components/app/AppSection';
import { PropertyLayout } from '@/components/app/PropertyLayout';
import { TasksList } from '@/components/app/TasksList';
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <PropertyHeader property={propertyTyped} featuredMedia={allMedia?.[0] || null} />
      <PropertyLayout
        header={null}
        sidebar={<PropertyAccess propertyId={propertyTyped.id} />}
      >
        <AppSection>
          <PropertyMeta property={propertyTyped} />
        </AppSection>

        <AppSection title="Gallery" description="Key photos for this property.">
          <PropertyGallery propertyId={propertyTyped.id} media={allMedia || []} />
        </AppSection>

        <AppSection title="Documents" description="Stored securely with signed URLs.">
          <PropertyDocuments propertyId={propertyTyped.id} />
        </AppSection>

        <AppSection title="Events" description="Activity timeline across this passport.">
          <PropertyEvents propertyId={propertyTyped.id} />
        </AppSection>

        <AppSection title="Flags" description="Issues or blockers that need attention.">
          <PropertyFlags propertyId={propertyTyped.id} />
        </AppSection>

        <AppSection title="Tasks" description="Track actions across this property.">
          <div className="space-y-4">
            <CreateTaskDialog propertyId={propertyTyped.id} onSubmit={createTaskAction} />
            <TasksList tasks={tasks || []} />
          </div>
        </AppSection>
      </PropertyLayout>
    </div>
  );
}
