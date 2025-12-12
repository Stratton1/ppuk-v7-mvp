/**
 * File: property-tasks-section.tsx
 * Purpose: Display and manage property tasks
 * Type: Server Component wrapper with client components for interaction
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from '@/components/property/tasks/task-list';
import { CreateTaskDialog } from '@/components/property/tasks/create-task-dialog';
import type { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

interface PropertyTasksSectionProps {
  propertyId: string;
  tasks: Task[];
}

export function PropertyTasksSection({ propertyId, tasks }: PropertyTasksSectionProps) {
  const openTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <Card data-testid="property-tasks-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tasks</CardTitle>
            <p className="text-sm text-muted-foreground">
              {openTasks.length} open, {completedTasks.length} completed
            </p>
          </div>
          <CreateTaskDialog propertyId={propertyId} />
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add tasks to track actions and blockers for this property.
            </p>
          </div>
        ) : (
          <TaskList tasks={tasks} />
        )}
      </CardContent>
    </Card>
  );
}

export default PropertyTasksSection;
