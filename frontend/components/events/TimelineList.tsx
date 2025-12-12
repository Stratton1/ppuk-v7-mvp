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
    return <div className="text-sm text-muted-foreground">No activity yet.</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3" data-testid={`timeline-entry-${item.id}`}>
          <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-muted text-lg">
            {iconMap[item.type] ?? '•'}
          </div>
          <div className="flex-1 space-y-1 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="capitalize">{item.message || item.type.replace('.', ' ')}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString('en-GB')}
              </span>
            </div>
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(item.metadata, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
