/**
 * File: admin/page.tsx
 * Purpose: Admin dashboard with system KPIs
 */

import { createClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/types/supabase';

type DashboardStats = Database['public']['Functions']['get_admin_dashboard_stats']['Returns'];

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch dashboard stats
  const { data: stats, error } = await supabase.rpc('get_admin_dashboard_stats');

  if (error) {
    console.error('Admin dashboard stats error:', error);
  }

  const statsData = (stats as DashboardStats) || {
    total_properties: 0,
    active_properties: 0,
    draft_properties: 0,
    archived_properties: 0,
    total_users: 0,
    total_documents: 0,
    total_media: 0,
    api_cache_entries: 0,
    open_flags: 0,
    resolved_flags: 0,
    total_tasks: 0,
  };

  return (
    <div className="space-y-6">
      <AppSection title="System Overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Properties"
            value={statsData.total_properties}
            description={`${statsData.active_properties} active, ${statsData.draft_properties} draft`}
          />
          <StatCard
            title="Total Users"
            value={statsData.total_users}
            description="Registered users"
          />
          <StatCard
            title="Documents"
            value={statsData.total_documents}
            description="Uploaded documents"
          />
          <StatCard
            title="Media Files"
            value={statsData.total_media}
            description="Photos and videos"
          />
        </div>
      </AppSection>

      <AppSection title="System Health">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Open Flags"
            value={statsData.open_flags}
            description="Issues requiring attention"
            variant={statsData.open_flags > 0 ? 'warning' : 'default'}
          />
          <StatCard
            title="Active Tasks"
            value={statsData.total_tasks}
            description="Pending tasks"
          />
          <StatCard
            title="API Cache"
            value={statsData.api_cache_entries}
            description="Cached API responses"
          />
        </div>
      </AppSection>

      <AppSection title="Property Status Breakdown">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatusCard
            label="Active"
            count={statsData.active_properties}
            total={statsData.total_properties}
            color="bg-green-500"
          />
          <StatusCard
            label="Draft"
            count={statsData.draft_properties}
            total={statsData.total_properties}
            color="bg-yellow-500"
          />
          <StatusCard
            label="Archived"
            count={statsData.archived_properties}
            total={statsData.total_properties}
            color="bg-gray-500"
          />
        </div>
      </AppSection>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  variant = 'default',
}: {
  title: string;
  value: number;
  description: string;
  variant?: 'default' | 'warning';
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusCard({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{count}</span>
            <span className="text-sm text-muted-foreground">{percentage}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${color} transition-all`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

