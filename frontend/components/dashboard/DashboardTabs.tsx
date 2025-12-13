'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppKPI } from '@/components/app/AppKPI';
import { DashboardPropertyCard } from '@/components/dashboard/property-card';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { AccessUnavailable } from '@/components/app/AccessUnavailable';
import { IssueList } from '@/components/issues/IssueList';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { MediaGrid } from '@/components/media/MediaGrid';
import { TimelineList } from '@/components/events/TimelineList';
import type { DashboardConfig } from '@/components/dashboard/getDashboardConfig';
import type { Issue } from '@/lib/issues/types';
import type { UidDocument } from '@/lib/documents/types';
import type { UidMedia } from '@/lib/media/types';
import type { TimelineEntry } from '@/lib/events/types';
import type { Database } from '@/types/supabase';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type InvitationRow = Database['public']['Tables']['invitations']['Row'];
type DashboardStats = {
  ownedProperties: number;
  accessibleProperties: number;
  unresolvedFlags: number;
  totalDocuments: number;
};

type ActivityItem = {
  property_id: string;
  property_address: string;
  event_type: string;
  created_at: string;
};

export type DashboardTabsProps = {
  role: string;
  config: DashboardConfig;
  stats: DashboardStats | null;
  properties: (PropertyRow & { completion?: number; imageUrl?: string | null })[];
  recommended?: (PropertyRow & { completion?: number; imageUrl?: string | null })[];
  invitations: InvitationRow[];
  issues: Issue[];
  documents: UidDocument[];
  recentMedia: UidMedia[];
  timeline: TimelineEntry[];
  activity: ActivityItem[];
};

export function DashboardTabs({
  role: _role,
  config,
  stats,
  properties,
  recommended = [],
  invitations,
  issues,
  documents,
  recentMedia,
  timeline,
  activity,
}: DashboardTabsProps) {
  void _role;
  const invitationsCount = invitations?.length ?? 0;
  const issuesCount = issues?.length ?? 0;
  const openIssues = (issues || []).filter((issue) => issue.status === 'open' || issue.status === 'in_progress');
  const severityCounts = openIssues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const allowedTabs = new Set(config.tabs);
  const firstTab = config.tabs[0] ?? 'overview';

  return (
    <Tabs defaultValue={firstTab} className="space-y-6">
      <TabsList>
        {allowedTabs.has('overview') && (
          <TabsTrigger value="overview" data-testid="dashboard-tab-overview">
            Overview
          </TabsTrigger>
        )}
        {allowedTabs.has('properties') && (
          <TabsTrigger value="properties" data-testid="dashboard-tab-properties">
            My Properties
          </TabsTrigger>
        )}
        {allowedTabs.has('invitations') && (
          <TabsTrigger value="invitations" data-testid="dashboard-tab-invitations">
            Invitations
          </TabsTrigger>
        )}
        {allowedTabs.has('issues') && (
          <TabsTrigger value="issues" data-testid="dashboard-tab-issues">
            Issues
          </TabsTrigger>
        )}
        {allowedTabs.has('documents') && (
          <TabsTrigger value="documents" data-testid="dashboard-tab-documents">
            Documents
          </TabsTrigger>
        )}
        {allowedTabs.has('media') && (
          <TabsTrigger value="media" data-testid="dashboard-tab-media">
            Media
          </TabsTrigger>
        )}
        {allowedTabs.has('activity') && (
          <TabsTrigger value="activity" data-testid="dashboard-tab-activity">
            Activity Feed
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="overview" data-testid="tab-panel-overview" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AppKPI
            label="Owned Properties"
            value={stats?.ownedProperties ?? 0}
            hint="You created these passports"
          />
          <AppKPI
            label="Accessible Properties"
            value={stats?.accessibleProperties ?? 0}
            hint="Shared with you"
          />
          <AppKPI label="Unresolved Flags" value={stats?.unresolvedFlags ?? 0} hint="Issues to review" />
          <AppKPI label="Documents Uploaded" value={stats?.totalDocuments ?? 0} hint="Across your properties" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Highlighted properties</CardTitle>
                <p className="text-sm text-muted-foreground">Most recent passports you can access.</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/properties">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No properties yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.slice(0, 6).map((prop, index) => (
                  <DashboardPropertyCard
                    key={prop.id}
                    property={prop}
                    completion={prop.completion ?? 0}
                    imageUrl={prop.imageUrl}
                    priority={index === 0}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="dashboard-documents-widget">
            <CardHeader>
              <CardTitle className="text-base">Documents overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Track critical documents like Title, EPC, Warranty, and Planning.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <StatPill label="Total documents" value={documents.length} />
                <StatPill label="Missing key docs" value={calculateMissingDocuments(documents)} />
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/properties">Upload missing documents</Link>
              </Button>
              {documents.slice(0, 3).map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </CardContent>
          </Card>

          <Card data-testid="dashboard-media-widget">
            <CardHeader>
              <CardTitle className="text-base">Recent media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Latest uploads across your properties.</p>
              <MediaGrid media={recentMedia.slice(0, 3)} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="properties" data-testid="tab-panel-properties">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">My Properties</CardTitle>
                <p className="text-sm text-muted-foreground">Accessible passports with quick actions.</p>
              </div>
              <Button asChild size="sm" data-testid="action-add-property-secondary">
                <Link href="/properties/create">Add property</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No properties found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((prop, index) => (
                  <DashboardPropertyCard
                    key={prop.id}
                    property={prop}
                    completion={prop.completion ?? 0}
                    imageUrl={prop.imageUrl}
                    priority={index === 0}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {recommended.length > 0 && (
          <Card data-testid="dashboard-recommended-panel">
            <CardHeader>
              <CardTitle className="text-base">Recommended properties</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.slice(0, 5).map((prop, index) => (
                <div key={prop.id} data-testid={`dashboard-recommended-${prop.id}`}>
                  <DashboardPropertyCard
                    property={prop}
                    completion={prop.completion ?? 0}
                    imageUrl={prop.imageUrl}
                    priority={index === 0}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="invitations" data-testid="tab-panel-invitations">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Invitations</CardTitle>
              <div className="rounded-lg border px-3 py-1 text-xs text-muted-foreground">
                {invitationsCount} open
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>Track invites you have sent or received for property access.</p>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" data-testid="action-open-invitations">
                <Link href="/invitations">Open invitations</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/tasks">View issues</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="issues" data-testid="tab-panel-issues">
        <div className="space-y-4" data-testid="dashboard-issues-tab">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Issues & Alerts</CardTitle>
                <div className="rounded-lg border px-3 py-1 text-xs text-muted-foreground">
                  {issuesCount} total
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Monitor issues across your properties. Open items are shown below with severity breakdown.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatPill label="Critical" value={severityCounts.critical ?? 0} />
                <StatPill label="High" value={severityCounts.high ?? 0} />
                <StatPill label="Medium" value={severityCounts.medium ?? 0} />
                <StatPill label="Low" value={severityCounts.low ?? 0} />
              </div>
              <Button asChild size="sm" data-testid="action-open-issues">
                <Link href="/properties">Go to properties</Link>
              </Button>
            </CardContent>
          </Card>

          <IssueList issues={openIssues} />
        </div>
      </TabsContent>

      <TabsContent value="activity" data-testid="tab-panel-activity">
        <div className="space-y-4" data-testid="dashboard-activity-panel">
          <ActivityTimeline items={activity} />
          <TimelineList items={timeline} />
        </div>
      </TabsContent>

      <TabsContent value="documents" data-testid="tab-panel-documents">
        {allowedTabs.has('documents') ? (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <AccessUnavailable
                title="No documents"
                description="Documents will appear here once uploaded."
                optionalActionHref="/properties"
                optionalActionLabel="Go to properties"
              />
            ) : (
              documents.slice(0, 5).map((doc) => <DocumentCard key={doc.id} document={doc} />)
            )}
          </div>
        ) : (
          <AccessUnavailable title="Access unavailable" description="This tab is not enabled for your role." />
        )}
      </TabsContent>

      <TabsContent value="media" data-testid="tab-panel-media">
        {allowedTabs.has('media') ? (
          <MediaGrid media={recentMedia.slice(0, 6)} />
        ) : (
          <AccessUnavailable title="Access unavailable" description="This tab is not enabled for your role." />
        )}
      </TabsContent>

      {!allowedTabs.has('issues') && (
        <TabsContent value="issues">
          <AccessUnavailable title="Access unavailable" description="This tab is not enabled for your role." />
        </TabsContent>
      )}
    </Tabs>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-primary">{value}</div>
    </div>
  );
}

function calculateMissingDocuments(documents: UidDocument[]): number {
  const required = ['ownership', 'environmental', 'guarantees'];
  const present = new Set(documents.map((doc) => doc.category));
  return required.filter((cat) => !present.has(cat as never)).length;
}
