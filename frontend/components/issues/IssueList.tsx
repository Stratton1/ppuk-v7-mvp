import { AlertTriangle } from 'lucide-react';
import { IssueCard } from '@/components/issues/IssueCard';
import type { Issue } from '@/lib/issues/types';

type IssueListProps = {
  issues: Issue[];
};

export function IssueList({ issues }: IssueListProps) {
  if (!issues || issues.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center"
        data-testid="issue-empty-state"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">No issues found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Issues will appear here when flagged.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="issue-list">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
