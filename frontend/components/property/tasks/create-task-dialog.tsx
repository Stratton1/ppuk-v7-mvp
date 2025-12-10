'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createPropertyTaskAction } from '@/actions/property-tasks';

type CreateTaskDialogProps = {
  propertyId: string;
  forceHighPriority?: boolean;
};

export const CreateTaskDialog = ({ propertyId, forceHighPriority = false }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(forceHighPriority ? 'high' : 'medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPropertyTaskAction({
        propertyId,
        title,
        description,
        priority,
        dueDate: dueDate || null,
      });
      if (!result.success) {
        setError(result.error || 'Failed to save task');
        toast({ title: 'Failed to save task', description: result.error, variant: 'destructive' });
        return;
      }
      toast({ title: 'Task created', description: title });
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority(forceHighPriority ? 'high' : 'medium');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} data-testid="add-task-button">
        Add Task
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">New Task</h4>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          data-testid="task-title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details for this task"
          data-testid="task-description"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            disabled={forceHighPriority}
            data-testid="task-priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          data-testid="task-submit"
        >
          {loading ? 'Saving…' : 'Save Task'}
        </Button>
      </div>
    </div>
  );
};
