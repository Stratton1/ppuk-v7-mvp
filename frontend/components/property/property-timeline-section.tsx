import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventCreateDialog } from '@/components/property/timeline/event-create-dialog';
import { EventList, TimelineEvent } from '@/components/property/timeline/event-list';

type PropertyTimelineSectionProps = {
  propertyId: string;
};

const mockEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    title: 'EPC uploaded',
    category: 'doc',
    date: '2025-03-10',
    description: 'Energy performance certificate added to documents.',
  },
  {
    id: 'evt-2',
    title: 'Survey booked',
    category: 'survey',
    date: '2025-03-12',
    description: 'Homebuyer survey scheduled with SurveyCo.',
  },
  {
    id: 'evt-3',
    title: 'Title review started',
    category: 'legal',
    date: '2025-03-15',
    description: 'Conveyancer reviewing title and searches.',
  },
];

export function PropertyTimelineSection({ propertyId }: PropertyTimelineSectionProps) {
  void propertyId; // placeholder until wired to backend

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Recent events</h3>
        <EventCreateDialog />
      </div>
      <EventList events={mockEvents} loading={false} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming timeline</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Timeline will track milestones like offer accepted, searches ordered, survey results, exchange, and completion.
        </CardContent>
      </Card>
    </div>
  );
}
