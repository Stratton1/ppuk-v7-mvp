'use client';

import { Badge } from '@/components/ui/badge';
import type { IssueSeverity, IssueStatus } from '@/lib/issues/types';

type SeverityBadgeProps = { severity: IssueSeverity };
type StatusBadgeProps = { status: IssueStatus };

const severityClassNames: Record<IssueSeverity, string> = {
  low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-orange-50 text-orange-800 border-orange-200',
  critical: 'bg-red-50 text-red-800 border-red-200',
};

const statusClassNames: Record<IssueStatus, string> = {
  open: 'bg-blue-50 text-blue-800 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function IssueSeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-testid="issue-severity-badge"
      className={severityClassNames[severity]}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
}

export function IssueStatusBadge({ status }: StatusBadgeProps) {
  const label = status === 'in_progress' ? 'In progress' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge
      variant="outline"
      data-testid="issue-status-badge"
      className={statusClassNames[status]}
    >
      {label}
    </Badge>
  );
}
