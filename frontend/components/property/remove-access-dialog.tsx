/**
 * File: remove-access-dialog.tsx
 * Purpose: Confirmation dialog for revoking property access
 * Type: Client Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { revokePropertyRole } from '@/actions/revoke-property-role';
import type { Database } from '@/types/supabase';

interface RemoveAccessDialogProps {
  propertyId: string;
  userId: string;
  userName: string;
  status: Database['public']['Enums']['property_status_type'] | null;
  permission: Database['public']['Enums']['property_permission_type'] | null;
  children: React.ReactNode; // Trigger button
}

export function RemoveAccessDialog({
  propertyId,
  userId,
  userName,
  status,
  permission,
  children,
}: RemoveAccessDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle revoke confirmation
   */
  const handleRevoke = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await revokePropertyRole(propertyId, userId, status, permission);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success - close dialog and refresh
      setOpen(false);
      router.refresh();
    } catch (error: unknown) {
      console.error('Revoke error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Remove Access</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke this user&apos;s access to the property?
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="rounded-md bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">⚠️ Warning: Access Revocation</p>
          <p className="mt-1 text-destructive">
            This user will immediately lose access to the property and its documents.
          </p>
        </div>

        {/* User Details */}
        <div className="space-y-2 rounded-md border p-4">
          <div>
            <p className="text-sm font-medium">User:</p>
            <p className="text-sm text-muted-foreground">{userName}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Current Access:</p>
            <p className="text-sm text-muted-foreground capitalize">
              {[status, permission].filter(Boolean).join(' / ') || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRevoke}
            disabled={loading}
          >
            {loading ? 'Removing...' : 'Remove Access'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
