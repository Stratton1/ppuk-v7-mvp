import { IssueCard } from '@/components/issues/IssueCard';
import type { Issue } from '@/lib/issues/types';

type IssueListProps = {
  issues: Issue[];
};

export function IssueList({ issues }: IssueListProps) {
  if (!issues || issues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground" data-testid="issue-empty-state">
        No issues found.
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
