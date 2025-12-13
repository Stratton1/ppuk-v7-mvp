'use client';

import {
  Home,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  CheckSquare,
  Flag,
  CheckCircle,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type ActivityItem = {
  property_id: string;
  property_address: string;
  event_type: string;
  created_at: string;
};

type ActivityTimelineProps = {
  items: ActivityItem[];
  maxItems?: number;
};

type EventConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
};

const eventConfig: Record<string, EventConfig> = {
  created: { label: 'Property created', icon: Home, color: 'text-primary bg-primary/10' },
  updated: { label: 'Property updated', icon: RefreshCw, color: 'text-muted-foreground bg-muted' },
  status_changed: { label: 'Status changed', icon: RefreshCw, color: 'text-warning bg-warning/10' },
  document_uploaded: { label: 'Document uploaded', icon: FileText, color: 'text-success bg-success/10' },
  media_uploaded: { label: 'Media uploaded', icon: ImageIcon, color: 'text-accent bg-accent/10' },
  note_added: { label: 'Note added', icon: MessageSquare, color: 'text-muted-foreground bg-muted' },
  task_created: { label: 'Task created', icon: CheckSquare, color: 'text-warning bg-warning/10' },
  flag_added: { label: 'Flag added', icon: Flag, color: 'text-destructive bg-destructive/10' },
  flag_resolved: { label: 'Flag resolved', icon: CheckCircle, color: 'text-success bg-success/10' },
};

const defaultEventConfig: EventConfig = {
  label: 'Activity',
  icon: RefreshCw,
  color: 'text-muted-foreground bg-muted',
};

export const ActivityTimeline = ({ items, maxItems = 10 }: ActivityTimelineProps) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<RefreshCw className="h-5 w-5" />}
        title="No recent activity"
        description="Activity will appear here as you work on your properties."
        variant="muted"
      />
    );
  }

  const displayItems = items.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative space-y-0 stagger-children">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 h-[calc(100%-16px)] w-px bg-border" />

          {displayItems.map((item, index) => {
            const config = eventConfig[item.event_type] ?? defaultEventConfig;
            const Icon = config.icon;
            const isLast = index === displayItems.length - 1;

            return (
              <div
                key={`${item.property_id}-${item.created_at}`}
                className={cn('relative flex gap-4 pb-4', isLast && 'pb-0')}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    config.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-0.5 pt-1">
                  <p className="text-sm font-medium text-foreground">{config.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.property_address}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
