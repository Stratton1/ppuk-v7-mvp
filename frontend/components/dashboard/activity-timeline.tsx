import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

type ActivityItem = {
  property_id: string;
  property_address: string;
  event_type: string;
  created_at: string;
};

type ActivityTimelineProps = {
  items: ActivityItem[];
};

const eventLabels: Record<string, string> = {
  created: 'Created property',
  updated: 'Updated property',
  status_changed: 'Status changed',
  document_uploaded: 'Document uploaded',
  media_uploaded: 'Media uploaded',
  note_added: 'Note added',
  task_created: 'Task created',
  flag_added: 'Flag added',
  flag_resolved: 'Flag resolved',
};

export const ActivityTimeline = ({ items }: ActivityTimelineProps) => {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">No recent activity.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={`${item.property_id}-${item.created_at}`} className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {eventLabels[item.event_type] ?? item.event_type}
              </p>
              <p className="text-sm text-muted-foreground">{item.property_address}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
