import type { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, Gavel, Home, UserSquare2 } from 'lucide-react';

export type EventCategory = 'legal' | 'survey' | 'doc' | 'agent' | 'general';

export type TimelineEvent = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  description?: string | null;
};

const categoryMap: Record<
  EventCategory,
  { label: string; icon: ComponentType<{ className?: string }>; badge: 'default' | 'secondary' | 'outline' }
> = {
  legal: { label: 'Legal', icon: Gavel, badge: 'default' },
  survey: { label: 'Survey', icon: Home, badge: 'secondary' },
  doc: { label: 'Document', icon: FileText, badge: 'outline' },
  agent: { label: 'Agent', icon: UserSquare2, badge: 'outline' },
  general: { label: 'General', icon: CalendarDays, badge: 'outline' },
};

export function EventCard({ event }: { event: TimelineEvent }) {
  const meta = categoryMap[event.category];
  const Icon = meta.icon;

  return (
    <Card className="shadow-sm" data-testid="timeline-event">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{event.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{event.date}</p>
        </div>
        <Badge variant={meta.badge} className="flex items-center gap-1">
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </Badge>
      </CardHeader>
      {event.description && (
        <CardContent className="text-sm text-muted-foreground">{event.description}</CardContent>
      )}
    </Card>
  );
}
