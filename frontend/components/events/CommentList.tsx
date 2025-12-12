'use client';

import { TimelineEntry } from '@/lib/events/types';

type CommentListProps = {
  comments: TimelineEntry[];
};

export function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return <div className="text-sm text-muted-foreground">No comments yet.</div>;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-lg border bg-card p-3" data-testid={`comment-entry-${comment.id}`}>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{comment.actor_user_id ?? 'Unknown user'}</span>
            <span>{new Date(comment.created_at).toLocaleString('en-GB')}</span>
          </div>
          <p className="text-sm text-foreground">{comment.message}</p>
        </div>
      ))}
    </div>
  );
}
