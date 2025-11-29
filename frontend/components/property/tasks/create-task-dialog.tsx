'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/types/supabase';

type TaskInsert = Database['public']['Tables']['property_tasks']['Insert'];
type TaskInsertWithoutUser = Omit<TaskInsert, 'created_by_user_id'>;

type CreateTaskDialogProps = {
  propertyId: string;
  onSubmit: (task: TaskInsertWithoutUser) => Promise<void>;
};

export const CreateTaskDialog = ({ propertyId, onSubmit }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskInsert['priority']>('medium');
  const [status, setStatus] = useState<TaskInsert['status']>('open');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        property_id: propertyId,
        title,
        description,
        priority,
        status,
        due_date: dueDate || null,
      });
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setStatus('open');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
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
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details for this task"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskInsert['priority'])}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskInsert['status'])}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_docs">Awaiting Docs</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit} disabled={loading || !title.trim()}>
          {loading ? 'Saving…' : 'Save Task'}
        </Button>
      </div>
    </div>
  );
};
