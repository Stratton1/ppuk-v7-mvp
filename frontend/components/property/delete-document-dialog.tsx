/**
 * File: delete-document-dialog.tsx
 * Purpose: Confirmation dialog for deleting property documents
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
import { deletePropertyDocument } from '@/actions/delete-property-document';

interface DeleteDocumentDialogProps {
  documentId: string;
  propertyId: string;
  documentTitle: string;
  documentType: string;
  fileName?: string;
  fileSize?: number;
  children: React.ReactNode; // Trigger button
}

export function DeleteDocumentDialog({
  documentId,
  propertyId,
  documentTitle,
  documentType,
  fileName,
  fileSize,
  children,
}: DeleteDocumentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deletePropertyDocument(documentId, propertyId);

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
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Banner */}
        <div className="rounded-md bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">⚠️ Warning: Permanent Deletion</p>
          <p className="mt-1 text-destructive">
            This will permanently delete the file from storage and remove all metadata.
          </p>
        </div>

        {/* Document Details */}
        <div className="space-y-3 rounded-md border p-4">
          <div>
            <p className="text-sm font-medium">Document Title:</p>
            <p className="text-sm text-muted-foreground">{documentTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Document Type:</p>
            <p className="text-sm text-muted-foreground capitalize">
              {documentType.replace('_', ' ')}
            </p>
          </div>
          {fileName && (
            <div>
              <p className="text-sm font-medium">File Name:</p>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
          )}
          {fileSize && (
            <div>
              <p className="text-sm font-medium">File Size:</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
            </div>
          )}
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
            {loading ? 'Deleting...' : 'Delete Document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
