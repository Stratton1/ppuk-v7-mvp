export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssueCategory =
  | 'safety'
  | 'compliance'
  | 'documents'
  | 'structural'
  | 'legal'
  | 'general';

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'safety',
  'compliance',
  'documents',
  'structural',
  'legal',
  'general',
];

export type Issue = {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  category: IssueCategory;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  dueDate?: string | null;
};

export type IssueEventType = 'created' | 'status_changed' | 'comment_added' | 'updated';

export type IssueEvent = {
  id: string;
  issueId: string;
  type: IssueEventType;
  message: string;
  createdAt: string;
  createdBy: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlagsRow = any;

export function mapSeverity(severity?: string | null): IssueSeverity {
  const value = (severity || '').toLowerCase();
  if (value === 'critical') return 'critical';
  if (value === 'high' || value === 'red') return 'high';
  if (value === 'medium' || value === 'warning') return 'medium';
  return 'low';
}

export function mapStatus(status?: string | null): IssueStatus {
  const value = (status || '').toLowerCase();
  if (value === 'in_review' || value === 'in-progress' || value === 'in_progress') return 'in_progress';
  if (value === 'resolved') return 'resolved';
  if (value === 'dismissed' || value === 'closed') return 'closed';
  return 'open';
}

export function mapCategory(flagType?: string | null): IssueCategory {
  const value = (flagType || '').toLowerCase();
  if (value === 'risk' || value === 'safety') return 'safety';
  if (value === 'compliance') return 'compliance';
  if (value === 'document' || value === 'documents') return 'documents';
  if (value === 'ownership' || value === 'legal') return 'legal';
  if (value === 'structural') return 'structural';
  if (value === 'data_quality') return 'general';
  return 'general';
}

function extractTitleAndDescription(rawDescription: string | null, fallbackType: string): {
  title: string;
  description: string | null;
  dueDate: string | null;
} {
  if (!rawDescription) {
    return { title: humanizeFlagType(fallbackType), description: null, dueDate: null };
  }

  const parts = rawDescription.split('\n\n');
  const titlePart = parts[0]?.trim();
  const remainder = parts.slice(1).join('\n\n').trim();

  const dueMatch = rawDescription.match(/Due:\s*(.+)/i);
  const dueDate = dueMatch ? dueMatch[1]?.trim() ?? null : null;

  if (parts.length > 1 && titlePart) {
    return { title: titlePart, description: remainder || null, dueDate };
  }

  return {
    title: humanizeFlagType(fallbackType),
    description: rawDescription.trim() || null,
    dueDate,
  };
}

export function flagRowToIssue(row: FlagsRow): Issue {
  const { title, description, dueDate } = extractTitleAndDescription(row.description ?? null, row.flag_type ?? 'general');

  return {
    id: row.id,
    propertyId: row.property_id,
    title: title || 'Untitled issue',
    description,
    severity: mapSeverity(row.severity),
    status: mapStatus(row.status),
    category: mapCategory(row.flag_type),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    createdBy: row.created_by_user_id ?? null,
    dueDate,
  };
}

export function humanizeFlagType(flagType?: string | null): string {
  if (!flagType) return 'Issue';
  return flagType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getIssueSeverityLabel(severity: IssueSeverity): string {
  switch (severity) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
    default:
      return 'Low';
  }
}

export function buildDefaultIssueEvents(issue: Issue): IssueEvent[] {
  const events: IssueEvent[] = [
    {
      id: `${issue.id}-created`,
      issueId: issue.id,
      type: 'created',
      message: 'Issue created',
      createdAt: issue.createdAt,
      createdBy: issue.createdBy,
    },
  ];

  if (issue.status === 'resolved' || issue.status === 'closed') {
    events.push({
      id: `${issue.id}-resolved`,
      issueId: issue.id,
      type: 'status_changed',
      message: issue.status === 'resolved' ? 'Issue resolved' : 'Issue closed',
      createdAt: issue.updatedAt ?? issue.createdAt,
      createdBy: issue.createdBy,
    });
  }

  return events;
}
