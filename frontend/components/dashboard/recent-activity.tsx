/**
 * File: dashboard/recent-activity.tsx
 * Purpose: Display recent activity timeline for user's properties
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardRecentActivityProps {
  userId: string;
}

/**
 * Event type icons and labels
 */
const EVENT_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  created: { icon: '🏠', label: 'Property Created', color: 'bg-blue-100 text-blue-800' },
  updated: { icon: '✏️', label: 'Property Updated', color: 'bg-gray-100 text-gray-800' },
  status_changed: { icon: '🔄', label: 'Status Changed', color: 'bg-yellow-100 text-yellow-800' },
  document_uploaded: { icon: '📄', label: 'Document Uploaded', color: 'bg-green-100 text-green-800' },
  media_uploaded: { icon: '🖼️', label: 'Media Uploaded', color: 'bg-purple-100 text-purple-800' },
  note_added: { icon: '🗒️', label: 'Note Added', color: 'bg-indigo-100 text-indigo-800' },
  task_created: { icon: '📌', label: 'Task Created', color: 'bg-orange-100 text-orange-800' },
  flag_added: { icon: '🚩', label: 'Flag Added', color: 'bg-red-100 text-red-800' },
  flag_resolved: { icon: '🕊️', label: 'Flag Resolved', color: 'bg-emerald-100 text-emerald-800' },
};

/**
 * Format timestamp for display
 */
function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Extract event details from payload
 */
function getEventDetails(eventType: string, payload: unknown): string {
  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const record = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    const getString = (key: string) => (typeof record[key] === 'string' ? (record[key] as string) : undefined);

    switch (eventType) {
      case 'created':
        return `Property created via ${getString('created_source') || 'manual form'}`;
      case 'updated':
        return 'Property details updated';
      case 'status_changed':
        return `Status changed to ${getString('new_status') || 'unknown'}`;
      case 'document_uploaded':
        return `Document: ${getString('title') || getString('file') || 'Unknown document'}`;
      case 'media_uploaded':
        return `Media: ${getString('file_name') || getString('description') || 'Unknown media'}`;
      case 'note_added':
        return getString('note') || getString('text') || 'Note added';
      case 'task_created':
        return `Task: ${getString('title') || getString('description') || 'New task'}`;
      case 'flag_added':
        return `Flag: ${getString('flag_type') || 'Issue flagged'}`;
      case 'flag_resolved':
        return `Flag resolved: ${getString('flag_type') || 'Issue resolved'}`;
      default:
        return 'Event occurred';
    }
  } catch {
    return 'Event occurred';
  }
}

export async function DashboardRecentActivity({ userId }: DashboardRecentActivityProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get properties user has access to
  const getUserPropertiesArgs: Database['public']['Functions']['get_user_properties']['Args'] = {
    user_id: userId,
  };
  const { data: userProperties } = await supabase.rpc('get_user_properties', getUserPropertiesArgs);

  const propertyIds = userProperties?.map((p) => p.property_id) || [];

  if (propertyIds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No recent activity. Activity will appear here once you have properties.
        </CardContent>
      </Card>
    );
  }

  // Fetch events from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: events, error } = await supabase
    .from('property_events')
    .select(
      `
      id,
      property_id,
      event_type,
      event_payload,
      actor_user_id,
      created_at,
      properties!inner(display_address)
    `
    )
    .in('property_id', propertyIds)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-destructive">
          Unable to load recent activity. Please try again later.
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No recent activity in the last 30 days.
        </CardContent>
      </Card>
    );
  }

  // Fetch actor user info in bulk
  // Fetch actor user info in bulk
  const actorIds = [...new Set(
    events
      .map((e) => e.actor_user_id)
      .filter((id): id is string => !!id)
  )];

  const { data: actors, error: actorsError } = await supabase
    .from('users')
    .select('id, full_name')
    .in('id', actorIds);

  if (actorsError) {
    console.error('Error fetching actor user data:', actorsError);
  }

  const actorsMap = new Map((actors ?? []).map((a) => [a.id, a]));

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {events.map((event) => {
            const eventConfig = EVENT_CONFIG[event.event_type] || {
              icon: '📋',
              label: event.event_type,
              color: 'bg-gray-100 text-gray-800',
            };
            const actor = event.actor_user_id ? actorsMap.get(event.actor_user_id) : null;
            const actorName = actor?.full_name ?? 'Unknown User';
            const property =
              'properties' in event && event.properties && typeof event.properties === 'object'
                ? (event.properties as { display_address?: string })
                : null;

            return (
              <div key={event.id} className="flex gap-4 p-4 hover:bg-muted/50 transition-colors">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${eventConfig.color}`}>
                    <span className="text-lg">{eventConfig.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{eventConfig.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {getEventDetails(event.event_type, event.event_payload)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(event.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{property?.display_address || 'Unknown property'}</span>
                    <span>•</span>
                    <span>{actorName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
