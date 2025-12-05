import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

type TasksListProps = {
  tasks: Task[];
  onCreate?: () => void;
  onUpdate?: (task: Task) => void;
};

const statusLabels: Record<Task['status'], string> = {
  open: 'Open',
  in_progress: 'In Progress',
  awaiting_docs: 'Awaiting Docs',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const statusOrder: Task['status'][] = ['open', 'in_progress', 'awaiting_docs', 'resolved', 'cancelled'];

export function TasksList({ tasks, onCreate, onUpdate }: TasksListProps) {
  const grouped = statusOrder.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">Track actions and blockers across this property.</p>
        </div>
        {onCreate && (
          <Button size="sm" onClick={onCreate} aria-label="Add task">
            Add Task
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {grouped.map((group) => (
          <div
            key={group.status}
            className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm shadow-glow-xs backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{statusLabels[group.status]}</span>
                <Badge variant="outline" className="text-xs">
                  {group.items.length}
                </Badge>
              </div>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            {group.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks in this state.</p>
            ) : (
              <div className="space-y-3">
                {group.items.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onUpdate?.(task)}
                    className={cn(
                      'w-full rounded-xl border border-border/60 bg-background/50 p-3 text-left text-sm transition',
                      'hover:-translate-y-0.5 hover:shadow-glow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                    aria-label={`Open task ${task.title}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{task.title}</p>
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
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TasksList;
