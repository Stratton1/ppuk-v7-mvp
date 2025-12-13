/**
 * File: upload-photo-dialog.tsx
 * Purpose: Modal dialog for uploading property photos
 * Type: Client Component
 */

'use client';

import Image from 'next/image';
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
import { uploadPropertyPhoto } from '@/actions/upload-property-photo';

interface UploadPhotoDialogProps {
  propertyId: string;
}

/**
 * Media type options
 */
const MEDIA_TYPES = [
  { value: 'photo', label: 'Photo', icon: '📸' },
  { value: 'floorplan', label: 'Floorplan', icon: '🗺️' },
  { value: 'other', label: 'Other', icon: '🖼️' },
];

export function UploadPhotoDialog({ propertyId }: UploadPhotoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10MB');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.type}. Please upload an image or PDF.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Generate preview for images (not PDFs)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
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
      const result = await uploadPropertyPhoto(propertyId, formData);

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
        setPreviewUrl(null);
        router.refresh(); // Refresh to show new photo
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
      setPreviewUrl(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Upload Photo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogDescription>
            Add a new photo to this property. Supported formats: JPG, PNG, WEBP, GIF, PDF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success Message */}
          {success && (
            <div className="rounded-xl border border-success/50 bg-success/10 p-4 text-sm text-success">
              Photo uploaded successfully. Refreshing...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Media Type */}
          <div className="space-y-2">
            <Label htmlFor="mediaType">
              Media Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="mediaType"
              name="mediaType"
              required
              disabled={loading || success}
              defaultValue="photo"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {MEDIA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Choose the category for this media
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
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf"
              onChange={handleFileChange}
              required
              disabled={loading || success}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Maximum file size: 10MB. Supported: JPG, PNG, WEBP, GIF, PDF
            </p>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </Badge>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative h-48 w-full overflow-hidden rounded-md border">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain bg-muted"
                />
              </div>
            </div>
          )}

          {/* Optional Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Add a description for this photo..."
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
              {loading ? 'Uploading...' : success ? 'Uploaded!' : 'Upload Photo'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium">What happens next:</p>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>Photo will be securely uploaded to Supabase Storage</li>
              <li>Metadata will be saved to the database</li>
              <li>An event will be logged in the property timeline</li>
              <li>The photo will appear in the property gallery</li>
            </ul>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
