'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/types/supabase';

type NoteInsert = Database['public']['Tables']['property_notes']['Insert'];
type NoteInsertWithoutUser = Omit<NoteInsert, 'created_by_user_id'>;

type CreateNoteDialogProps = {
  propertyId: string;
  onSubmit: (note: NoteInsertWithoutUser) => Promise<void>;
};

export const CreateNoteDialog = ({ propertyId, onSubmit }: CreateNoteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<NoteInsert['note_type']>('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        property_id: propertyId,
        title,
        content,
        note_type: noteType,
        is_private: isPrivate,
        pinned,
      });
      setOpen(false);
      setTitle('');
      setContent('');
      setNoteType('general');
      setIsPrivate(false);
      setPinned(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Add Note
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">New Note</h4>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Details for this note"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="noteType">Type</Label>
          <select
            id="noteType"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteInsert['note_type'])}
          >
            <option value="general">General</option>
            <option value="inspection">Inspection</option>
            <option value="maintenance">Maintenance</option>
            <option value="legal">Legal</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="privateToggle">Privacy</Label>
          <div className="flex items-center gap-2 text-sm">
            <input
              id="privateToggle"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>Private note (elevated roles only)</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pinnedToggle">Pinned</Label>
          <div className="flex items-center gap-2 text-sm">
            <input id="pinnedToggle" type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            <span>Pin this note</span>
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit} disabled={loading || !content.trim()}>
          {loading ? 'Saving…' : 'Save Note'}
        </Button>
      </div>
    </div>
  );
};
