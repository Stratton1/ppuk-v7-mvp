import { Skeleton } from '@/components/ui/skeleton';
import { EventCard, TimelineEvent } from './event-card';
import { Card, CardContent } from '@/components/ui/card';

export type { TimelineEvent };

type EventListProps = {
  events: TimelineEvent[] | null;
  loading?: boolean;
  error?: string | null;
};

export function EventList({ events, loading, error }: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-3" data-testid="timeline-list">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-2 py-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="timeline-list">
        <Card>
          <CardContent className="py-6 text-sm text-destructive">Failed to load timeline: {error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div data-testid="timeline-list">
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No timeline events yet. Add milestones as the transaction progresses.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="timeline-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
