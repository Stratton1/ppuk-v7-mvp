/**
 * File: property-flags.tsx
 * Purpose: Display property flags and compliance issues with RLS filtering
 * Type: Server Component
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PropertyFlag = Database['public']['Tables']['property_flags']['Row'];
type UserExtended = Database['public']['Tables']['users_extended']['Row'];

interface FlagWithUsers extends PropertyFlag {
  createdBy?: Pick<UserExtended, 'full_name' | 'primary_role'> | null;
  resolvedBy?: Pick<UserExtended, 'full_name' | 'primary_role'> | null;
}

interface PropertyFlagsProps {
  propertyId: string;
}

/**
 * Flag type configuration with icons
 */
const FLAG_TYPE_CONFIG: Record<string, string> = {
  data_quality: '🧩',
  risk: '⚠️',
  compliance: '✓',
  ownership: '🏠',
  document: '📄',
  other: '🏷️',
};

/**
 * Severity configuration
 */
const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; priority: number }
> = {
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    priority: 1,
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    priority: 2,
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    priority: 3,
  },
  low: {
    label: 'Low',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    priority: 4,
  },
};

/**
 * Status configuration
 */
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; priority: number }> = {
  open: {
    label: 'Open',
    variant: 'default', // Red/destructive
    priority: 1,
  },
  in_review: {
    label: 'In Review',
    variant: 'secondary', // Purple
    priority: 2,
  },
  resolved: {
    label: 'Resolved',
    variant: 'outline', // Green (we'll add custom class)
    priority: 3,
  },
  dismissed: {
    label: 'Dismissed',
    variant: 'outline', // Gray
    priority: 4,
  },
};

/**
 * Get flag type icon
 */
function getFlagIcon(flagType: string): string {
  return FLAG_TYPE_CONFIG[flagType] || '🏷️';
}

/**
 * Get severity configuration
 */
function getSeverityConfig(severity: string) {
  return SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
}

/**
 * Get status configuration
 */
function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.open;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Group flags by severity and status
 */
function groupFlags(flags: FlagWithUsers[]): Record<string, FlagWithUsers[]> {
  const grouped: Record<string, FlagWithUsers[]> = {};

  // First, group by severity
  flags.forEach((flag) => {
    const key = flag.severity;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(flag);
  });

  // Sort within each severity group by status priority, then by created_at
  Object.keys(grouped).forEach((severity) => {
    grouped[severity].sort((a, b) => {
      const statusA = getStatusConfig(a.status).priority;
      const statusB = getStatusConfig(b.status).priority;
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  return grouped;
}

/**
 * Sort severity keys by priority
 */
function sortSeverities(severities: string[]): string[] {
  return severities.sort((a, b) => {
    const priorityA = getSeverityConfig(a).priority;
    const priorityB = getSeverityConfig(b).priority;
    return priorityA - priorityB;
  });
}

export async function PropertyFlags({ propertyId }: PropertyFlagsProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all flags for this property (RLS will filter automatically)
  const { data: flags, error: flagsError } = await supabase
    .from('property_flags')
    .select('*')
    .eq('property_id', propertyId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Handle error
  if (flagsError) {
    console.error('Error fetching property flags:', flagsError);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flags & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load flags for this property. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state (no flags visible to user or none exist)
  if (!flags || flags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flags & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This property has no recorded flags or compliance issues.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Flags are filtered based on your access permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Fetch user information for created_by and resolved_by
  const createdByIds = [...new Set(flags.map((f) => f.created_by_user_id))];
  const resolvedByIds = [
    ...new Set(flags.map((f) => f.resolved_by_user_id).filter((id): id is string => id !== null)),
  ];
  const allUserIds = [...new Set([...createdByIds, ...resolvedByIds])];

  const { data: users } = await supabase
    .from('users_extended')
    .select('user_id, full_name, primary_role')
    .in('user_id', allUserIds);

  // Create user lookup map
  const userMap = new Map<string, Pick<UserExtended, 'full_name' | 'primary_role'>>();
  users?.forEach((user) => {
    userMap.set(user.user_id, {
      full_name: user.full_name,
      primary_role: user.primary_role,
    });
  });

  // Merge flags with user information
  const flagsWithUsers: FlagWithUsers[] = flags.map((flag) => ({
    ...flag,
    createdBy: userMap.get(flag.created_by_user_id),
    resolvedBy: flag.resolved_by_user_id ? userMap.get(flag.resolved_by_user_id) : null,
  }));

  // Count active (open or in_review) flags
  const activeCount = flagsWithUsers.filter(
    (f) => f.status === 'open' || f.status === 'in_review'
  ).length;

  // Group flags by severity
  const groupedFlags = groupFlags(flagsWithUsers);
  const sortedSeverities = sortSeverities(Object.keys(groupedFlags));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Flags & Compliance</CardTitle>
        <p className="text-sm text-muted-foreground">
          {activeCount > 0
            ? `${activeCount} active ${activeCount === 1 ? 'issue' : 'issues'}`
            : `${flags.length} ${flags.length === 1 ? 'flag' : 'flags'} recorded (all resolved)`}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedSeverities.map((severity) => {
          const severityConfig = getSeverityConfig(severity);
          const severityFlags = groupedFlags[severity];

          return (
            <div key={severity} className="space-y-3">
              {/* Severity Header */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{severityConfig.label}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {severityFlags.length}
                </Badge>
              </div>

              {/* Flags List */}
              <div className="space-y-3">
                {severityFlags.map((flag) => {
                  const statusConfig = getStatusConfig(flag.status);
                  const isResolved = flag.status === 'resolved';
                  const isDismissed = flag.status === 'dismissed';

                  return (
                    <div
                      key={flag.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        {/* Flag Icon */}
                        <span className="text-2xl" title={flag.flag_type}>
                          {getFlagIcon(flag.flag_type)}
                        </span>

                        {/* Flag Content */}
                        <div className="flex-1 space-y-2">
                          {/* Header with badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-sm">{flag.description}</p>
                            <div className="ml-auto flex gap-2">
                              <Badge className={severityConfig.color}>
                                {severityConfig.label}
                              </Badge>
                              <Badge
                                variant={statusConfig.variant}
                                className={
                                  isResolved
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : isDismissed
                                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                    : flag.status === 'in_review'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }
                              >
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {/* Created by */}
                            <div className="flex items-center gap-1">
                              <span>Created by</span>
                              {flag.createdBy ? (
                                <span className="font-medium">
                                  {flag.createdBy.full_name}
                                  {flag.createdBy.primary_role && (
                                    <span className="capitalize"> ({flag.createdBy.primary_role})</span>
                                  )}
                                </span>
                              ) : (
                                <span>Unknown</span>
                              )}
                              <span>•</span>
                              <span>{formatDate(flag.created_at)}</span>
                            </div>

                            {/* Resolved by (if applicable) */}
                            {isResolved && flag.resolved_at && (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <span>Resolved by</span>
                                {flag.resolvedBy ? (
                                  <span className="font-medium">
                                    {flag.resolvedBy.full_name}
                                    {flag.resolvedBy.primary_role && (
                                      <span className="capitalize">
                                        {' '}
                                        ({flag.resolvedBy.primary_role})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span>Unknown</span>
                                )}
                                <span>•</span>
                                <span>{formatDate(flag.resolved_at)}</span>
                              </div>
                            )}

                            {/* Flag type */}
                            <div className="capitalize text-muted-foreground">
                              Type: {flag.flag_type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer note */}
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Flags highlight potential issues, risks, or compliance requirements. Only authorized
            users can view and manage flags.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

