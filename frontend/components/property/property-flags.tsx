/**
 * File: property-flags.tsx
 * Purpose: Property flags component with create, list, and resolve functionality
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { createPropertyFlag, updatePropertyFlag, deletePropertyFlag } from '@/actions/property-flags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, XCircle, Plus } from 'lucide-react';

type PropertyFlag = {
  id: string;
  property_id: string;
  flag_type: string;
  severity: string;
  status: string;
  description: string;
  created_at: string;
  resolved_at?: string | null;
  deleted_at?: string | null;
};

interface PropertyFlagsProps {
  propertyId: string;
}

export function PropertyFlags({ propertyId }: PropertyFlagsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any;

  // Fetch flags
  const { data: flags, isLoading } = useQuery({
    queryKey: ['property-flags', propertyId],
    queryFn: async () => {
      const { data, error } = await supabaseAny
        .from('property_flags')
        .select('*')
        .eq('property_id', propertyId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PropertyFlag[];
    },
  });

  // Create flag mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return createPropertyFlag(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-flags', propertyId] });
      setCreateDialogOpen(false);
    },
  });

  // Update flag mutation
  const updateMutation = useMutation({
    mutationFn: async ({ formData }: { flagId: string; formData: FormData }) => {
      return updatePropertyFlag(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-flags', propertyId] });
      setResolveDialogOpen(null);
    },
  });

  // Delete flag mutation
  const deleteMutation = useMutation({
    mutationFn: async (flagId: string) => {
      return deletePropertyFlag(flagId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-flags', propertyId] });
    },
  });

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'outline';
      case 'high':
        return 'outline';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  const getSeverityClassName = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return 'border-destructive/60 text-destructive';
    }
    return undefined;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'in_review':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading flags...</div>
        </CardContent>
      </Card>
    );
  }

  const openFlags = flags?.filter((f) => f.status === 'open') || [];
  const otherFlags = flags?.filter((f) => f.status !== 'open') || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Property Flags</CardTitle>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Property Flag</DialogTitle>
              <DialogDescription>
                Flag an issue or concern with this property.
              </DialogDescription>
            </DialogHeader>
            <form
              action={(formData) => {
                formData.append('propertyId', propertyId);
                createMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="flagType">Flag Type</Label>
                <select
                  name="flagType"
                  id="flagType"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select flag type</option>
                  <option value="data_quality">Data Quality</option>
                  <option value="risk">Risk</option>
                  <option value="compliance">Compliance</option>
                  <option value="ownership">Ownership</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <select
                  name="severity"
                  id="severity"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  name="description"
                  placeholder="Describe the issue..."
                  required
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Flag'}
                </Button>
              </DialogFooter>
            </form>
            {createMutation.isError && (
              <div className="text-sm text-destructive mt-2">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'Failed to create flag'}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {flags && flags.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No flags for this property.
          </div>
        ) : (
          <>
            {openFlags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Open Flags</h4>
                {openFlags.map((flag) => (
                  <FlagCard
                    key={flag.id}
                    flag={flag}
                    onResolve={(flagId) => setResolveDialogOpen(flagId)}
                    onDelete={(flagId) => deleteMutation.mutate(flagId)}
                    getSeverityVariant={getSeverityVariant}
                    getSeverityClassName={getSeverityClassName}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}
            {otherFlags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Resolved/Closed</h4>
                {otherFlags.map((flag) => (
                  <FlagCard
                    key={flag.id}
                    flag={flag}
                    onResolve={(flagId) => setResolveDialogOpen(flagId)}
                    onDelete={(flagId) => deleteMutation.mutate(flagId)}
                    getSeverityVariant={getSeverityVariant}
                    getSeverityClassName={getSeverityClassName}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Resolve Flag Dialog */}
      {resolveDialogOpen && (
        <ResolveFlagDialog
          flagId={resolveDialogOpen}
          open={!!resolveDialogOpen}
          onOpenChange={(open) => !open && setResolveDialogOpen(null)}
          onResolve={(flagId, formData) => {
            updateMutation.mutate({ flagId, formData });
          }}
          isPending={updateMutation.isPending}
        />
      )}
    </Card>
  );
}

function FlagCard({
  flag,
  onResolve,
  onDelete,
  getSeverityVariant,
  getSeverityClassName,
  getStatusIcon,
}: {
  flag: PropertyFlag;
  onResolve: (flagId: string) => void;
  onDelete: (flagId: string) => void;
  getSeverityVariant: (severity: string) => 'default' | 'secondary' | 'outline';
  getSeverityClassName: (severity: string) => string | undefined;
  getStatusIcon: (status: string) => React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(flag.status)}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">
                {flag.flag_type.replace('_', ' ')}
              </span>
              <Badge variant={getSeverityVariant(flag.severity)} className={getSeverityClassName(flag.severity)}>
                {flag.severity}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {flag.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {flag.status === 'open' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(flag.id)}
            >
              Resolve
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(flag.id)}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Created {new Date(flag.created_at).toLocaleDateString('en-GB')}
        {flag.resolved_at && (
          <> • Resolved {new Date(flag.resolved_at).toLocaleDateString('en-GB')}</>
        )}
      </div>
    </div>
  );
}

function ResolveFlagDialog({
  flagId,
  open,
  onOpenChange,
  onResolve,
  isPending,
}: {
  flagId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (flagId: string, formData: FormData) => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Flag</DialogTitle>
          <DialogDescription>
            Mark this flag as resolved or dismissed.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            formData.append('flagId', flagId);
            onResolve(flagId, formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              name="status"
              id="status"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select status</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="in_review">In Review</option>
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
