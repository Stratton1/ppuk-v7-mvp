/**
 * File: admin/analytics/page.tsx
 * Purpose: System analytics page with charts
 */

import { createClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/types/supabase';

type PropertiesOverTime = Database['public']['Functions']['get_properties_over_time']['Returns'];
type UserGrowth = Database['public']['Functions']['get_user_growth']['Returns'];
type DocumentUploads = Database['public']['Functions']['get_document_uploads_over_time']['Returns'];
type ApiUsage = Database['public']['Functions']['get_api_usage_by_provider']['Returns'];

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const daysBack = 30;

  // Fetch analytics data
  const [
    { data: propertiesData },
    { data: usersData },
    { data: documentsData },
    { data: apiUsageData },
  ] = await Promise.all([
    supabase.rpc('get_properties_over_time', { days_back: daysBack }),
    supabase.rpc('get_user_growth', { days_back: daysBack }),
    supabase.rpc('get_document_uploads_over_time', { days_back: daysBack }),
    supabase.rpc('get_api_usage_by_provider'),
  ]);

  const properties = (propertiesData as PropertiesOverTime) || [];
  const users = (usersData as UserGrowth) || [];
  const documents = (documentsData as DocumentUploads) || [];
  const apiUsage = (apiUsageData as ApiUsage) || [];

  return (
    <div className="space-y-6">
      <AppSection title="Properties Over Time">
        <Card>
          <CardHeader>
            <CardTitle>Property Creation Trend (Last {daysBack} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trend (Last {daysBack} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>Document Upload Trend (Last {daysBack} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>External API Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {apiUsage.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
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

