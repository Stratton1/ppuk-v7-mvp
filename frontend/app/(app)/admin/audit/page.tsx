/**
 * File: admin/audit/page.tsx
 * Purpose: Audit log viewer for admins
 */

import { createClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/types/supabase';

type AuditLog = Database['public']['Functions']['get_audit_logs']['Returns'][number];

interface AuditPageProps {
  searchParams: {
    page?: string;
    userId?: string;
    resourceType?: string;
    action?: string;
  };
}

export default async function AdminAuditPage({ searchParams }: AuditPageProps) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 100;
  const offset = (page - 1) * limit;

  // Fetch audit logs
  const { data: logs, error } = await supabase.rpc('get_audit_logs', {
    p_limit: limit,
    p_offset: offset,
    p_user_id: searchParams.userId || null,
    p_resource_type: searchParams.resourceType || null,
    p_action: searchParams.action || null,
  });

  if (error) {
    console.error('Audit log fetch error:', error);
  }

  const logsList = (logs as AuditLog[] | null) || [];

  // Generate CSV export
  const csvData = logsList
    .map(
      (log) =>
        `${log.id},${log.actor_user_id || ''},${log.action},${log.resource_type},${log.resource_id || ''},${log.created_at},${JSON.stringify(log.metadata || {})}`
    )
    .join('\n');
  const csvHeaders = 'ID,Actor User ID,Action,Resource Type,Resource ID,Created At,Metadata\n';
  const csvContent = csvHeaders + csvData;

  return (
    <AppSection title="Audit Log">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {offset + 1}-{offset + logsList.length} of audit log entries
          </div>
          {logsList.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`}
                download="audit-log.csv"
              >
                Export CSV
              </a>
            </Button>
          )}
        </div>

        {logsList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No audit log entries found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left text-sm font-medium">Timestamp</th>
                  <th className="p-4 text-left text-sm font-medium">Actor</th>
                  <th className="p-4 text-left text-sm font-medium">Action</th>
                  <th className="p-4 text-left text-sm font-medium">Resource</th>
                  <th className="p-4 text-left text-sm font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logsList.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-sm">
                      {new Date(log.created_at).toLocaleString('en-GB')}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-xs">
                        {log.actor_user_id ? log.actor_user_id.substring(0, 8) + '...' : 'System'}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium capitalize">
                          {log.resource_type}
                        </div>
                        {log.resource_id && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.resource_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <a href={`/admin/audit?page=${page - 1}`}>Previous</a>
              </Button>
            )}
            {logsList.length === limit && (
              <Button asChild variant="outline" size="sm">
                <a href={`/admin/audit?page=${page + 1}`}>Next</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppSection>
  );
}

