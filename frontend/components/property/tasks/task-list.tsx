import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/supabase';
import { format } from 'date-fns';

type Task = Database['public']['Tables']['tasks']['Row'];

type TaskListProps = {
  tasks: Task[];
  onCreate?: () => void;
  onUpdate?: (task: Task) => void;
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  awaiting_docs: 'Awaiting Docs',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

const priorityLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const statusOrder = ['open', 'in_progress', 'awaiting_docs', 'resolved', 'cancelled'];

export const TaskList = ({ tasks, onCreate, onUpdate }: TaskListProps) => {
  const grouped = statusOrder.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">Track tasks across this property.</p>
        </div>
        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            Add Task
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {grouped.map((group) => (
          <Card key={group.status}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{statusLabels[group.status] ?? group.status}</span>
                <Badge variant="outline" className="text-xs">
                  {group.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks in this state.</p>
              ) : (
                group.items.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-md border p-3 text-sm transition hover:shadow-sm"
                    onClick={() => onUpdate?.(task)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant="secondary" className="capitalize">
                        {priorityLabels[task.priority] ?? task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-muted-foreground">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {format(new Date(task.created_at), 'd MMM yyyy')}</span>
                      {task.due_date && <span>Due {format(new Date(task.due_date), 'd MMM yyyy')}</span>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
