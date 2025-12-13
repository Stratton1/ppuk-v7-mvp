/**
 * File: upload-document-dialog.tsx
 * Purpose: Modal dialog for uploading property documents
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
import { Badge } from '@/components/ui/badge';
import { uploadPropertyDocument } from '@/actions/upload-property-document';

interface UploadDocumentDialogProps {
  propertyId: string;
}

/**
 * Document type options matching database constraint
 */
const DOCUMENT_TYPES = [
  { value: 'title', label: 'Title Deed', icon: '📜' },
  { value: 'survey', label: 'Survey Report', icon: '📋' },
  { value: 'search', label: 'Property Search', icon: '🔍' },
  { value: 'identity', label: 'ID Document', icon: '🪪' },
  { value: 'contract', label: 'Contract', icon: '📝' },
  { value: 'warranty', label: 'Warranty', icon: '🛡️' },
  { value: 'planning', label: 'Planning Permission', icon: '🏗️' },
  { value: 'compliance', label: 'Compliance Certificate', icon: '✓' },
  { value: 'other', label: 'Other Document', icon: '📄' },
];

export function UploadDocumentDialog({ propertyId }: UploadDocumentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size must not exceed 20MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

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

      // Validate file is selected
      if (!selectedFile) {
        setError('Please select a file to upload');
        setLoading(false);
        return;
      }

      // Call server action
      const result = await uploadPropertyDocument(propertyId, formData);

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
        setSelectedFile(null);
        router.refresh(); // Refresh to show new document
      }, 1500);
    } catch (error: unknown) {
      console.error('Upload error:', error);
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
      // Reset form state
      setError(null);
      setSuccess(false);
      setSelectedFile(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Upload Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to this property. Supported formats: PDF, DOCX, images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success Message */}
          {success && (
            <div className="rounded-xl border border-success/50 bg-success/10 p-4 text-sm text-success">
              Document uploaded successfully. Refreshing...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Document Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Official Copy of Title Register"
              required
              disabled={loading || success}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for this document
            </p>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="documentType">
              Document Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="documentType"
              name="documentType"
              required
              disabled={loading || success}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a document type...</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Choose the category that best describes this document
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              File <span className="text-destructive">*</span>
            </Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.tiff"
              onChange={handleFileChange}
              required
              disabled={loading || success}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Maximum file size: 20MB. Supported: PDF, DOCX, Excel, images
            </p>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </Badge>
              </div>
            )}
          </div>

          {/* Version Number */}
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              name="version"
              type="number"
              min="1"
              defaultValue="1"
              disabled={loading || success}
            />
            <p className="text-xs text-muted-foreground">
              Version number for document tracking (default: 1)
            </p>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes about this document..."
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
            <Button type="submit" disabled={loading || success || !selectedFile}>
              {loading ? 'Uploading...' : success ? 'Uploaded!' : 'Upload Document'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">What happens next:</p>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>Document will be securely uploaded to Supabase Storage</li>
              <li>Metadata will be saved to the database</li>
              <li>An event will be logged in the property timeline</li>
              <li>The document will be visible to authorized users based on their role</li>
            </ul>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
