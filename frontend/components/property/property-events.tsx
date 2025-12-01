/**
 * File: property-events.tsx
 * Purpose: Display property events timeline with automatic RLS filtering
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PropertyEvent = Database['public']['Tables']['property_events']['Row'];

interface EventWithActor extends PropertyEvent {
  actor?: { full_name: string | null } | null;
}

interface PropertyEventsProps {
  propertyId: string;
}

/**
 * Event type configuration with icons and labels
 */
const EVENT_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  created: {
    icon: '🏠',
    label: 'Property Created',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  updated: {
    icon: '✏️',
    label: 'Property Updated',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  status_changed: {
    icon: '🔄',
    label: 'Status Change',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  document_uploaded: {
    icon: '📄',
    label: 'Document Uploaded',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  media_uploaded: {
    icon: '🖼️',
    label: 'Media Uploaded',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  },
  note_added: {
    icon: '🗒️',
    label: 'Note Added',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  task_created: {
    icon: '📌',
    label: 'Task Created',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  },
  flag_added: {
    icon: '🚩',
    label: 'Flag Added',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  flag_resolved: {
    icon: '🕊️',
    label: 'Flag Resolved',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  },
};

/**
 * Get event type configuration
 */
function getEventConfig(eventType: string) {
  return (
    EVENT_TYPE_CONFIG[eventType] || {
      icon: '📍',
      label: eventType,
      color: 'bg-gray-100 text-gray-800',
    }
  );
}

/**
 * Parse event payload safely
 */
function parseEventPayload(payload: unknown): Record<string, unknown> {
  if (!payload) return {};
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
}

/**
 * Extract relevant info from event payload
 */
function getEventDetails(event: PropertyEvent): string | null {
  const payload = parseEventPayload(event.event_payload);

  switch (event.event_type) {
    case 'status_changed':
      if (typeof payload.from === 'string' && typeof payload.to === 'string') {
        return `Changed from "${payload.from}" to "${payload.to}"`;
      }
      return null;

    case 'document_uploaded':
      if (typeof payload.document_type === 'string' && typeof payload.title === 'string') {
        return `${payload.title} (${payload.document_type})`;
      }
      if (typeof payload.title === 'string') {
        return payload.title;
      }
      return null;

    case 'media_uploaded':
      if (typeof payload.media_count === 'number') {
        return `${payload.media_count} ${payload.media_count === 1 ? 'file' : 'files'} uploaded`;
      }
      if (typeof payload.message === 'string') {
        return payload.message;
      }
      return null;

    case 'flag_added':
      if (typeof payload.flag_type === 'string' && typeof payload.severity === 'string') {
        return `${payload.flag_type} (${payload.severity} severity)`;
      }
      return null;

    case 'flag_resolved':
      if (typeof payload.flag_type === 'string') {
        return `${payload.flag_type} resolved`;
      }
      return null;

    case 'note_added':
      if (typeof payload.note === 'string') {
        return payload.note;
      }
      return null;

    case 'task_created':
      if (typeof payload.task_title === 'string') {
        return payload.task_title;
      }
      return null;

    default:
      if (typeof payload.message === 'string') {
        return payload.message;
      }
      return null;
  }
}

/**
 * Group events by time period
 */
function groupEventsByPeriod(events: EventWithActor[]): Record<string, EventWithActor[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const grouped: Record<string, EventWithActor[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'Last Week': [],
    Earlier: [],
  };

  events.forEach((event) => {
    const eventDate = new Date(event.created_at);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDay.getTime() === today.getTime()) {
      grouped.Today.push(event);
    } else if (eventDay.getTime() === yesterday.getTime()) {
      grouped.Yesterday.push(event);
    } else if (eventDay >= startOfWeek) {
      grouped['This Week'].push(event);
    } else if (eventDay >= startOfLastWeek) {
      grouped['Last Week'].push(event);
    } else {
      grouped.Earlier.push(event);
    }
  });

  // Remove empty groups
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export async function PropertyEvents({ propertyId }: PropertyEventsProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all events for this property (RLS will filter automatically)
  const { data: events, error: eventsError } = await supabase
    .from('property_events')
    .select('*')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Handle error
  if (eventsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load events: {eventsError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No events available for this property.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Events are filtered based on your access permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fetch actor information for all unique actor_user_ids
  const actorIds = [
    ...new Set(events.map((e) => e.actor_user_id).filter((id): id is string => id !== null)),
  ];

  const { data: actors } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', actorIds);

  // Create actor lookup map
  const actorMap = new Map<string, { full_name: string | null }>();
  actors?.forEach((actor) => {
    actorMap.set(actor.id, {
      full_name: actor.full_name,
    });
  });

  // Merge events with actor information
  const eventsWithActors: EventWithActor[] = events.map((event) => ({
    ...event,
    actor: event.actor_user_id ? actorMap.get(event.actor_user_id) : null,
  }));

  // Group events by time period
  const groupedEvents = groupEventsByPeriod(eventsWithActors);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Events Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          {events.length} {events.length === 1 ? 'event' : 'events'} recorded
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedEvents).map(([period, periodEvents]) => (
          <div key={period} className="space-y-3">
            {/* Period Header */}
            <h3 className="text-sm font-semibold text-muted-foreground">{period}</h3>

            {/* Timeline */}
            <div className="relative space-y-4 pl-8">
              {/* Vertical line */}
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

              {periodEvents.map((event) => {
                const config = getEventConfig(event.event_type);
                const details = getEventDetails(event);

                return (
                  <div key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-2 flex h-4 w-4 items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>

                    {/* Event card */}
                    <div className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        {/* Event info */}
                        <div className="flex-1 space-y-2">
                          {/* Header */}
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{config.icon}</span>
                            <span className="font-medium text-sm">{config.label}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {formatTimestamp(event.created_at)}
                            </Badge>
                          </div>

                          {/* Details */}
                          {details && (
                            <p className="text-sm text-muted-foreground">{details}</p>
                          )}

                          {/* Actor & date */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {event.actor && (
                              <>
                                <span>
                                  by {event.actor.full_name}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>{formatDate(event.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Events are automatically logged and immutable. Only authorized users can view event
            history.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
