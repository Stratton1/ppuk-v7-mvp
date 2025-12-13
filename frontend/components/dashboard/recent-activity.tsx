/**
 * File: dashboard/recent-activity.tsx
 * Purpose: Display recent activity timeline for user's properties
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import {
  Home,
  Pencil,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  CheckSquare,
  Flag,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { Database } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface DashboardRecentActivityProps {
  userId: string;
}

type EventConfigItem = {
  icon: LucideIcon;
  label: string;
  color: string;
};

/**
 * Event type icons and labels - using Lucide icons and semantic colors
 */
const EVENT_CONFIG: Record<string, EventConfigItem> = {
  created: { icon: Home, label: 'Property Created', color: 'text-primary bg-primary/10' },
  updated: { icon: Pencil, label: 'Property Updated', color: 'text-muted-foreground bg-muted' },
  status_changed: { icon: RefreshCw, label: 'Status Changed', color: 'text-warning bg-warning/10' },
  document_uploaded: { icon: FileText, label: 'Document Uploaded', color: 'text-success bg-success/10' },
  media_uploaded: { icon: ImageIcon, label: 'Media Uploaded', color: 'text-accent bg-accent/10' },
  note_added: { icon: MessageSquare, label: 'Note Added', color: 'text-muted-foreground bg-muted' },
  task_created: { icon: CheckSquare, label: 'Task Created', color: 'text-warning bg-warning/10' },
  flag_added: { icon: Flag, label: 'Flag Added', color: 'text-destructive bg-destructive/10' },
  flag_resolved: { icon: CheckCircle, label: 'Flag Resolved', color: 'text-success bg-success/10' },
};

const DEFAULT_EVENT_CONFIG: EventConfigItem = {
  icon: RefreshCw,
  label: 'Event',
  color: 'text-muted-foreground bg-muted',
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
      <EmptyState
        icon={<RefreshCw className="h-5 w-5" />}
        title="No recent activity"
        description="Activity will appear here once you have properties."
        variant="muted"
      />
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
      <EmptyState
        icon={<RefreshCw className="h-5 w-5" />}
        title="Unable to load activity"
        description="Please try again later."
        variant="error"
      />
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={<RefreshCw className="h-5 w-5" />}
        title="No recent activity"
        description="No activity recorded in the last 30 days."
        variant="muted"
      />
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
        <div className="divide-y divide-border/60">
          {events.map((event) => {
            const config = EVENT_CONFIG[event.event_type] || DEFAULT_EVENT_CONFIG;
            const Icon = config.icon;
            const actor = event.actor_user_id ? actorsMap.get(event.actor_user_id) : null;
            const actorName = actor?.full_name ?? 'Unknown User';
            const property =
              'properties' in event && event.properties && typeof event.properties === 'object'
                ? (event.properties as { display_address?: string })
                : null;

            return (
              <div
                key={event.id}
                className="flex gap-4 p-4 transition-colors duration-150 hover:bg-muted/30"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      config.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getEventDetails(event.event_type, event.event_payload)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {formatTimestamp(event.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                    <span className="truncate">{property?.display_address || 'Unknown property'}</span>
                    <span>·</span>
                    <span className="flex-shrink-0">{actorName}</span>
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
