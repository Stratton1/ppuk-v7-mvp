/**
 * File: admin/analytics/page.tsx
 * Purpose: System analytics page with charts
 */

import { createClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Note: These function types may not exist in schema yet - using stub types
type PropertiesOverTime = { date: string; count: number }[];
type UserGrowth = { date: string; count: number }[];
type DocumentUploads = { date: string; count: number }[];
type ApiUsage = { provider: string; count: number; last_fetched?: string }[];

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const daysBack = 30;

  let propertiesData: PropertiesOverTime | null = null;
  let usersData: UserGrowth | null = null;
  let documentsData: DocumentUploads | null = null;
  let apiUsageData: ApiUsage | null = null;

  try {
    // Fetch analytics data
    // Note: These RPC functions may not exist yet in schema - using any to bypass type check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;
    const [
      { data: propertiesDataRaw },
      { data: usersDataRaw },
      { data: documentsDataRaw },
      { data: apiUsageDataRaw },
    ] = await Promise.all([
      supabaseAny.rpc('get_properties_over_time', { days_back: daysBack }).catch(() => ({ data: null })),
      supabaseAny.rpc('get_user_growth', { days_back: daysBack }).catch(() => ({ data: null })),
      supabaseAny.rpc('get_document_uploads_over_time', { days_back: daysBack }).catch(() => ({ data: null })),
      supabaseAny.rpc('get_api_usage_by_provider').catch(() => ({ data: null })),
    ]);

    propertiesData = (propertiesDataRaw as PropertiesOverTime) || null;
    usersData = (usersDataRaw as UserGrowth) || null;
    documentsData = (documentsDataRaw as DocumentUploads) || null;
    apiUsageData = (apiUsageDataRaw as ApiUsage) || null;
  } catch (error) {
    console.error('Admin analytics RPCs missing or failed:', error);
  }

  const properties = propertiesData || [];
  const users = usersData || [];
  const documents = documentsData || [];
  const apiUsage = apiUsageData || [];

  const isEmpty = properties.length === 0 && users.length === 0 && documents.length === 0 && apiUsage.length === 0;

  return (
    <div className="space-y-6" data-testid={isEmpty ? 'admin-analytics-empty' : 'admin-analytics'}>
      <AppSection title="Properties Over Time">
        <Card data-testid="admin-analytics-properties">
          <CardHeader>
            <CardTitle>Property Creation Trend (Last {daysBack} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground" data-testid="admin-analytics-properties-empty">
                No data available
              </div>
            ) : (
              <div className="space-y-2">
                {properties.map((row) => (
                  <div key={row.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(row.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 bg-primary rounded"
                          style={{ width: `${Math.min((row.count / 10) * 100, 100)}%` }}
                        />
                        <span className="text-sm font-medium">{row.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AppSection>

      <AppSection title="User Growth">
        <Card data-testid="admin-analytics-users">
          <CardHeader>
            <CardTitle>User Registration Trend (Last {daysBack} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground" data-testid="admin-analytics-users-empty">
                No data available
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((row) => (
                  <div key={row.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(row.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 bg-green-500 rounded"
                          style={{ width: `${Math.min((row.count / 10) * 100, 100)}%` }}
                        />
                        <span className="text-sm font-medium">{row.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AppSection>

      <AppSection title="Document Uploads">
        <Card data-testid="admin-analytics-documents">
          <CardHeader>
            <CardTitle>Document Upload Trend (Last {daysBack} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground" data-testid="admin-analytics-documents-empty">
                No data available
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((row) => (
                  <div key={row.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {new Date(row.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 bg-blue-500 rounded"
                          style={{ width: `${Math.min((row.count / 20) * 100, 100)}%` }}
                        />
                        <span className="text-sm font-medium">{row.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AppSection>

      <AppSection title="API Usage by Provider">
        <Card data-testid="admin-analytics-api-usage">
          <CardHeader>
            <CardTitle>External API Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {apiUsage.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground" data-testid="admin-analytics-api-empty">
                No API usage data available
              </div>
            ) : (
              <div className="space-y-4">
                {apiUsage.map((row) => (
                  <div key={row.provider} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{row.provider}</div>
                      <div className="text-sm text-muted-foreground">
                        Last fetched: {row.last_fetched
                          ? new Date(row.last_fetched).toLocaleDateString('en-GB')
                          : 'Never'}
                      </div>
                    </div>
                    <div className="text-lg font-bold">{row.count}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AppSection>
    </div>
  );
}

