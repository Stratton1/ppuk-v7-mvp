'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createPropertyEventAction } from '@/actions/property-events';

type EventCreateDialogProps = {
  trigger?: React.ReactNode;
  propertyId: string;
};

export function EventCreateDialog({ trigger, propertyId }: EventCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const category = String(formData.get('category') || 'general');
    const description = String(formData.get('description') || '').trim();

    startTransition(async () => {
      const result = await createPropertyEventAction({
        propertyId,
        title,
        category,
        description: description || null,
      });

      if (!result.success) {
        toast({ title: 'Failed to add event', description: result.error, variant: 'destructive' });
        return;
      }

      toast({ title: 'Event added', description: 'Timeline updated.' });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" data-testid="add-event-button">
            Add event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add timeline event</DialogTitle>
          <DialogDescription>Track key milestones (survey, docs, legal, agent updates).</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g., Survey booked" data-testid="event-title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue="general"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="event-category"
            >
              <option value="legal">Legal</option>
              <option value="survey">Survey</option>
              <option value="doc">Document</option>
              <option value="agent">Agent</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Notes about this event" data-testid="event-description" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} data-testid="event-submit">
              {isPending ? 'Saving…' : 'Save event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
