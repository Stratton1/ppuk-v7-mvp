import { PropertyFlags } from '@/components/property/property-flags';
import { CreateTaskDialog } from '@/components/property/tasks/create-task-dialog';
import { TasksList } from '@/components/app/TasksList';
import type { Database } from '@/types/supabase';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

type PropertyFlagsSectionProps = {
  propertyId: string;
  tasks: TaskRow[];
};

export function PropertyFlagsSection({ propertyId, tasks }: PropertyFlagsSectionProps) {
  return (
    <div className="space-y-6">
      <PropertyFlags propertyId={propertyId} />
      <div className="space-y-4">
        <CreateTaskDialog propertyId={propertyId} />
        <TasksList tasks={tasks} />
      </div>
    </div>
  );
}
