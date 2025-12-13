'use client';

import {
  Home,
  RefreshCw,
  FileText,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  Pencil,
  CheckCircle,
  MessageSquare,
  Flag,
  Clock,
} from 'lucide-react';
import { TimelineEntry } from '@/lib/events/types';

type TimelineListProps = {
  items: TimelineEntry[];
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'property.created': Home,
  'property.updated': RefreshCw,
  'document.uploaded': FileText,
  'document.deleted': Trash2,
  'media.uploaded': ImageIcon,
  'media.deleted': Trash2,
  'issue.created': AlertTriangle,
  'issue.updated': Pencil,
  'issue.status_changed': CheckCircle,
  'comment.added': MessageSquare,
  'flag.raised': Flag,
  'flag.resolved': CheckCircle,
};

export function TimelineList({ items }: TimelineListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">No activity yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Activity will appear here as changes are made.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = iconMap[item.type] ?? Clock;
        return (
          <div key={item.id} className="flex gap-3" data-testid={`timeline-entry-${item.id}`}>
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50">
              <div className="flex items-center justify-between gap-2 text-sm font-medium">
                <span className="capitalize text-foreground">{item.message || item.type.replace('.', ' ')}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString('en-GB')}
                </span>
              </div>
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
