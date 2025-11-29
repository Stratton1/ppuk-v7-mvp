import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { PropertyHeader } from '@/components/property/property-header';
import { PropertyMeta } from '@/components/property/property-meta';
import { PropertyGallery } from '@/components/property/property-gallery';
import { PropertyDocuments } from '@/components/property/property-documents';
import { PropertyAccess } from '@/components/property/property-access';
import { PropertyEvents } from '@/components/property/property-events';
import { PropertyFlags } from '@/components/property/property-flags';
import { TaskList } from '@/components/property/tasks/task-list';
import { NoteList } from '@/components/property/notes/note-list';
import { CreateTaskDialog } from '@/components/property/tasks/create-task-dialog';
import { CreateNoteDialog } from '@/components/property/notes/create-note-dialog';
import { createNoteAction, createTaskAction } from '@/actions/tasks';
import type { Database } from '@/types/supabase';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const supabase = createServerSupabaseClient();

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

  const featuredMediaArgs: Database['public']['Functions']['get_featured_media']['Args'] = {
    property_id: propertyTyped.id,
  };
  const propertyTasksArgs: Database['public']['Functions']['get_property_tasks']['Args'] = {
    property_id: propertyTyped.id,
  };
  const propertyNotesArgs: Database['public']['Functions']['get_property_notes']['Args'] = {
    property_id: propertyTyped.id,
  };

  // Type assertions needed due to Supabase RPC type inference issues
  const [{ data: featuredMedia }, { data: allMedia }, { data: tasks }, { data: notes }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)('get_featured_media', featuredMediaArgs),
    supabase
      .from('property_media')
      .select('*')
      .eq('property_id', propertyTyped.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)('get_property_tasks', propertyTasksArgs),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.rpc as any)('get_property_notes', propertyNotesArgs),
  ]);

  return (
    <div className="container mx-auto space-y-8 py-8">
      <PropertyHeader property={propertyTyped} featuredMedia={featuredMedia?.[0] || null} />
      <PropertyMeta property={propertyTyped} />
      <PropertyGallery propertyId={propertyTyped.id} media={allMedia || []} />
      <PropertyDocuments propertyId={propertyTyped.id} />
      <PropertyAccess propertyId={propertyTyped.id} />
      <PropertyEvents propertyId={propertyTyped.id} />
      <PropertyFlags propertyId={propertyTyped.id} />

      {/* H. Tasks */}
      <div className="space-y-4">
        <CreateTaskDialog propertyId={propertyTyped.id} onSubmit={createTaskAction} />
        <TaskList tasks={tasks || []} />
      </div>

      {/* I. Notes */}
      <div className="space-y-4">
        <CreateNoteDialog propertyId={propertyTyped.id} onSubmit={createNoteAction} />
        <NoteList notes={notes || []} />
      </div>
    </div>
  );
}
