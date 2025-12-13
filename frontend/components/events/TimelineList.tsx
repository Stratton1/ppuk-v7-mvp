'use client';

import { TimelineEntry } from '@/lib/events/types';

type TimelineListProps = {
  items: TimelineEntry[];
};

const iconMap: Record<string, string> = {
  'property.created': '🏠',
  'property.updated': '🔄',
  'document.uploaded': '📄',
  'document.deleted': '🗑️',
  'media.uploaded': '🖼️',
  'media.deleted': '🗑️',
  'issue.created': '⚠️',
  'issue.updated': '✏️',
  'issue.status_changed': '✅',
  'comment.added': '💬',
  'flag.raised': '🚩',
  'flag.resolved': '✅',
};

export function TimelineList({ items }: TimelineListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3" data-testid={`timeline-entry-${item.id}`}>
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-base">
            {iconMap[item.type] ?? '•'}
          </div>
          <div className="flex-1 space-y-1 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm transition-shadow duration-200 hover:shadow-glow-sm">
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
      ))}
    </div>
  );
}
