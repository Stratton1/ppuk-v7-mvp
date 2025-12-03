/**
 * File: grant-access-dialog.tsx
 * Purpose: Dialog for granting property access to users
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { grantPropertyRole } from '@/actions/grant-property-role';

interface GrantAccessDialogProps {
  propertyId: string;
  children: React.ReactNode; // Trigger button
}

const GRANTABLE_STATUSES = [
  { value: 'owner', label: 'Owner', icon: '🏠' },
  { value: 'buyer', label: 'Buyer', icon: '🛒' },
  { value: 'tenant', label: 'Tenant', icon: '🧾' },
];

const GRANTABLE_PERMISSIONS = [
  { value: 'editor', label: 'Editor', icon: '✏️' },
  { value: 'viewer', label: 'Viewer', icon: '👁️' },
];

export function GrantAccessDialog({ propertyId, children }: GrantAccessDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);

      const result = await grantPropertyRole(propertyId, formData);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success!
      setSuccess(true);

      // Close dialog after brief delay
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      console.error('Grant error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Reset form when dialog closes
   */
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Grant Access</DialogTitle>
          <DialogDescription>
            Give a user access to this property with an optional status and a permission level.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              ✓ Access granted successfully! Refreshing...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* User ID Field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              User Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="e.g., user@example.com"
              required
              disabled={loading || success}
            />
            <p className="text-xs text-muted-foreground">
              Invite an existing user by their email. They must already be registered.
            </p>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status (optional)</Label>
            <select
              id="status"
              name="status"
              disabled={loading || success}
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">No status</option>
              {GRANTABLE_STATUSES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Status applies to consumers only. Owners are defaulted to Editor permission.
            </p>
          </div>

          {/* Permission Selection */}
          <div className="space-y-2">
            <Label htmlFor="permission">
              Permission <span className="text-destructive">*</span>
            </Label>
            <select
              id="permission"
              name="permission"
              required
              disabled={loading || success}
              defaultValue="viewer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {GRANTABLE_PERMISSIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.icon} {role.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Professionals get permission only; consumers can also receive a status.
            </p>
          </div>

          {/* Expiry Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              disabled={loading || success}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for permanent access. Set a date for time-limited access.
            </p>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Add any notes about this access grant..."
              disabled={loading || success}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || success}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? 'Granting...' : success ? 'Granted!' : 'Grant Access'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">What happens next:</p>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>User will be assigned the selected status (optional) and permission</li>
              <li>Owners default to Editor; professionals require explicit permission</li>
              <li>An event will be logged in the property timeline</li>
              <li>You can revoke access at any time</li>
            </ul>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
