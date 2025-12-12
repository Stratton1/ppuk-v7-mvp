import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IssueSeverityBadge, IssueStatusBadge } from '@/components/issues/IssueBadge';
import type { Issue } from '@/lib/issues/types';

type IssueCardProps = {
  issue: Issue;
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card data-testid="issue-card">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{issue.title}</CardTitle>
          <div className="flex items-center gap-2">
            <IssueSeverityBadge severity={issue.severity} />
            <IssueStatusBadge status={issue.status} />
          </div>
        </div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Category: <span className="capitalize">{issue.category}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {issue.description && <p className="text-sm text-muted-foreground">{issue.description}</p>}
        <div className="text-xs text-muted-foreground">
          Created {new Date(issue.createdAt).toLocaleDateString('en-GB')} • Updated{' '}
          {new Date(issue.updatedAt).toLocaleDateString('en-GB')}
        </div>
      </CardContent>
    </Card>
  );
}
