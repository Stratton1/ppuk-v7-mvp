/**
 * File: delete-media-dialog.tsx
 * Purpose: Confirmation dialog for deleting property media
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
import { deletePropertyMedia } from '@/actions/delete-property-media';

interface DeleteMediaDialogProps {
  mediaId: string;
  propertyId: string;
  mediaTitle: string;
  mediaType: string;
  children: React.ReactNode; // Trigger button
}

export function DeleteMediaDialog({
  mediaId,
  propertyId,
  mediaTitle,
  mediaType,
  children,
}: DeleteMediaDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deletePropertyMedia(mediaId, propertyId);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success - close dialog and refresh
      setOpen(false);
      router.refresh();
    } catch (error: unknown) {
      console.error('Delete error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Media</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this media file? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="rounded-md bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">⚠️ Warning: Permanent Deletion</p>
          <p className="mt-1 text-destructive">
            This will permanently delete the file from storage and remove all metadata.
          </p>
        </div>

        {/* Media Details */}
        <div className="space-y-2 rounded-md border p-4">
          <div>
            <p className="text-sm font-medium">Title:</p>
            <p className="text-sm text-muted-foreground">{mediaTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Type:</p>
            <p className="text-sm text-muted-foreground capitalize">{mediaType}</p>
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
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Media'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
