import type { IssueEvent } from '@/lib/issues/types';

type IssueTimelineProps = {
  events: IssueEvent[];
};

export function IssueTimeline({ events }: IssueTimelineProps) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-4" data-testid="issue-timeline">
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
          <div className="space-y-1">
            <div className="text-sm font-medium capitalize">{event.type.replace('_', ' ')}</div>
            <div className="text-sm text-muted-foreground">{event.message}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(event.createdAt).toLocaleString('en-GB')} {event.createdBy ? `• ${event.createdBy}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
