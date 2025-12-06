import { Skeleton } from '@/components/ui/skeleton';
import { EventCard, TimelineEvent } from './event-card';
import { Card, CardContent } from '@/components/ui/card';

type EventListProps = {
  events: TimelineEvent[] | null;
  loading?: boolean;
};

export function EventList({ events, loading }: EventListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
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

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          No timeline events yet. Add milestones as the transaction progresses.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
