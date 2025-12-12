import { getDefaultDashboardTabs, type DashboardRole } from '@/lib/roles/domain';

export type DashboardWidget =
  | 'propertiesList'
  | 'issuesSummary'
  | 'documentsPreview'
  | 'mediaPreview'
  | 'activityTimeline'
  | 'invitations'
  | 'watchlist';

export type DashboardConfig = {
  tabs: ReturnType<typeof getDefaultDashboardTabs>;
  widgets: DashboardWidget[];
};

export function getDashboardConfig(role: DashboardRole): DashboardConfig {
  const baseTabs = getDefaultDashboardTabs(role);
  let widgets: DashboardWidget[] = ['propertiesList', 'issuesSummary', 'documentsPreview', 'mediaPreview', 'activityTimeline'];

  if (role === 'buyer') {
    widgets = ['watchlist', 'issuesSummary', 'activityTimeline'];
  }

  if (role === 'admin') {
    widgets = ['propertiesList', 'issuesSummary', 'documentsPreview', 'mediaPreview', 'activityTimeline', 'invitations'];
  }

  return {
    tabs: baseTabs,
    widgets,
  };
}
