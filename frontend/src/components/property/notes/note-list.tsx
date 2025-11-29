import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/types/supabase';
import { format } from 'date-fns';

type Note = Database['public']['Tables']['property_notes']['Row'];

type NoteListProps = {
  notes: Note[];
  onCreate?: () => void;
};

const typeLabels: Record<string, string> = {
  general: 'General',
  inspection: 'Inspection',
  maintenance: 'Maintenance',
  legal: 'Legal',
  system: 'System',
};

export const NoteList = ({ notes, onCreate }: NoteListProps) => {
  const pinned = notes.filter((n) => n.pinned);
  const general = notes.filter((n) => !n.pinned);

  const renderGroup = (title: string, items: Note[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <Badge variant="outline" className="text-xs">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes.</p>
        ) : (
          items.map((note) => (
            <div key={note.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{note.title || 'Note'}</p>
                <Badge variant="secondary" className="capitalize">
                  {typeLabels[note.note_type] ?? note.note_type}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{note.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {format(new Date(note.created_at), 'd MMM yyyy HH:mm')}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notes</h3>
          <p className="text-sm text-muted-foreground">Pinned and general notes for this property.</p>
        </div>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
          >
            Add Note
          </button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {renderGroup('Pinned', pinned)}
        {renderGroup('General', general)}
      </div>
    </div>
  );
};
