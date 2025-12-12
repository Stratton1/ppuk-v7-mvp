export type EventType =
  | 'property.created'
  | 'property.updated'
  | 'document.uploaded'
  | 'document.deleted'
  | 'media.uploaded'
  | 'media.deleted'
  | 'issue.created'
  | 'issue.updated'
  | 'issue.status_changed'
  | 'comment.added'
  | 'flag.raised'
  | 'flag.resolved';

export type TimelineEntry = {
  id: string;
  type: EventType;
  created_at: string;
  actor_user_id: string | null;
  message: string;
  metadata: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export function flagToEvents(flagRow: AnyRow): TimelineEntry[] {
  if (!flagRow) return [];
  const entries: TimelineEntry[] = [
    {
      id: `${flagRow.id}-created`,
      type: 'flag.raised',
      created_at: flagRow.created_at,
      actor_user_id: flagRow.created_by_user_id ?? null,
      message: `Flag raised: ${flagRow.flag_type ?? 'issue'}`,
      metadata: { flag: flagRow },
    },
  ];
  if (flagRow.status === 'resolved' || flagRow.status === 'dismissed') {
    entries.push({
      id: `${flagRow.id}-resolved`,
      type: 'flag.resolved',
      created_at: flagRow.resolved_at ?? flagRow.updated_at ?? flagRow.created_at,
      actor_user_id: flagRow.resolved_by_user_id ?? null,
      message: `Flag ${flagRow.status}`,
      metadata: { flag: flagRow },
    });
  }
  return entries;
}

export function documentToEvents(docRow: AnyRow): TimelineEntry[] {
  if (!docRow) return [];
  return [
    {
      id: `${docRow.id}-uploaded`,
      type: 'document.uploaded',
      created_at: docRow.created_at,
      actor_user_id: docRow.uploaded_by_user_id ?? null,
      message: `Document uploaded: ${docRow.title ?? 'Document'}`,
      metadata: { document: docRow },
    },
  ];
}

export function mediaToEvents(mediaRow: AnyRow): TimelineEntry[] {
  if (!mediaRow) return [];
  return [
    {
      id: `${mediaRow.id}-uploaded`,
      type: 'media.uploaded',
      created_at: mediaRow.created_at,
      actor_user_id: mediaRow.uploaded_by_user_id ?? null,
      message: `Media uploaded: ${mediaRow.media_type ?? 'media'}`,
      metadata: { media: mediaRow },
    },
  ];
}

export function issueToEvents(issue: AnyRow, comments: TimelineEntry[] = []): TimelineEntry[] {
  if (!issue) return [];
  const items: TimelineEntry[] = [
    {
      id: `${issue.id}-created`,
      type: 'issue.created',
      created_at: issue.created_at,
      actor_user_id: issue.created_by ?? issue.created_by_user_id ?? null,
      message: issue.title ?? 'Issue created',
      metadata: { issue },
    },
  ];
  if (issue.status && issue.status !== 'open') {
    items.push({
      id: `${issue.id}-status`,
      type: 'issue.status_changed',
      created_at: issue.updated_at ?? issue.created_at,
      actor_user_id: issue.updated_by ?? issue.created_by ?? null,
      message: `Status changed to ${issue.status}`,
      metadata: { issue },
    });
  }
  return [...items, ...comments];
}

export function propertyToEvents(propertyRow: AnyRow): TimelineEntry[] {
  if (!propertyRow) return [];
  return [
    {
      id: `${propertyRow.id}-created`,
      type: 'property.created',
      created_at: propertyRow.created_at ?? propertyRow.inserted_at ?? new Date().toISOString(),
      actor_user_id: propertyRow.created_by_user_id ?? null,
      message: 'Property Passport created',
      metadata: { property: propertyRow },
    },
  ];
}

export function eventRowToEntry(row: AnyRow): TimelineEntry {
  return {
    id: row.id ?? crypto.randomUUID(),
    type: (row.event_type as EventType) ?? 'property.updated',
    created_at: row.created_at ?? new Date().toISOString(),
    actor_user_id: row.actor_user_id ?? null,
    message: row.event_payload?.message ?? row.event_type ?? 'Activity',
    metadata: row.event_payload ?? {},
  };
}
