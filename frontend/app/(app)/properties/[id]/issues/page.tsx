import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import { AppSection } from '@/components/app/AppSection';
import { IssueCard } from '@/components/issues/IssueCard';
import { IssueCreateForm } from '@/components/issues/IssueCreateForm';
import { IssueList } from '@/components/issues/IssueList';
import { IssueTimeline } from '@/components/issues/IssueTimeline';
import { CommentForm } from '@/components/events/CommentForm';
import { CommentList } from '@/components/events/CommentList';
import { createIssueAction } from '@/actions/issues';
import { createCommentAction, getCommentsFor } from '@/actions/events';
import { buildDefaultIssueEvents, flagRowToIssue, type Issue } from '@/lib/issues/types';

type PropertyIssuesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyIssuesPage({ params }: PropertyIssuesPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const user = await getServerUser();

  const { data: property } = await supabase
    .from('properties')
    .select('id, display_address')
    .eq('id', id)
    .maybeSingle();

  if (!property) {
    notFound();
  }

  const { data: canEdit } = await supabase.rpc('can_edit_property', { property_id: id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: flagRows } = await (supabase as any)
    .from('property_flags')
    .select('*')
    .eq('property_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const issues: Issue[] = (flagRows || []).map(flagRowToIssue);
  const commentsByIssue: Record<string, Awaited<ReturnType<typeof getCommentsFor>>> = {};
  await Promise.all(
    issues.map(async (issue) => {
      commentsByIssue[issue.id] = await getCommentsFor('issue', issue.id);
    })
  );
  const openIssues = issues.filter((issue) => issue.status === 'open' || issue.status === 'in_progress');
  const resolvedIssues = issues.filter((issue) => issue.status === 'resolved' || issue.status === 'closed');
  const allowEdits = Boolean(canEdit || user?.isAdmin);

  return (
    <div className="space-y-6" data-testid="property-issues-page">
      <AppPageHeader title="Issues" description="Track and resolve issues for this Property Passport." />

      {allowEdits && (
        <AppSection title="Create issue" description="Capture a new issue or alert for this property.">
          <IssueCreateForm propertyId={id} action={createIssueAction} />
        </AppSection>
      )}

      <AppSection title="Open issues" description="Issues that are active or in progress.">
        {openIssues.length === 0 ? (
          <IssueList issues={[]} />
        ) : (
          <div className="space-y-4">
            {openIssues.map((issue) => (
              <div key={issue.id} className="space-y-3">
                <IssueCard issue={issue} />
                <IssueTimeline events={buildDefaultIssueEvents(issue)} />
                <CommentList comments={commentsByIssue[issue.id] ?? []} />
                <CommentForm
                  onSubmit={(text) =>
                    createCommentAction({ targetId: issue.id, targetType: 'issue', text, propertyId: id })
                  }
                  inputTestId={`issue-comment-input-${issue.id}`}
                  submitTestId={`issue-comment-submit-${issue.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </AppSection>

      <AppSection title="Resolved issues" description="Closed or resolved issues.">
        {resolvedIssues.length === 0 ? (
          <IssueList issues={[]} />
        ) : (
          <div className="space-y-4">
            {resolvedIssues.map((issue) => (
              <div key={issue.id} className="space-y-3">
                <IssueCard issue={issue} />
                <IssueTimeline events={buildDefaultIssueEvents(issue)} />
                <CommentList comments={commentsByIssue[issue.id] ?? []} />
              </div>
            ))}
          </div>
        )}
      </AppSection>
    </div>
  );
}
