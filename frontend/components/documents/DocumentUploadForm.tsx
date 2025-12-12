'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DOCUMENT_CATEGORIES, type DocumentCategoryId } from '@/lib/documents/types';
import type { ActionResult } from '@/types/forms';

type DocumentUploadFormProps = {
  propertyId: string;
  action: (formData: FormData) => Promise<ActionResult>;
};

export function DocumentUploadForm({ propertyId, action }: DocumentUploadFormProps) {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    return action(formData);
  }, {});

  return (
    <form
      className="space-y-4 rounded-lg border bg-card p-4"
      data-testid="doc-upload-form"
      action={formAction}
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      <div className="space-y-2">
        <Label htmlFor="name">Document name</Label>
        <Input id="name" name="name" required placeholder="e.g. EPC certificate" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          required
          data-testid="doc-category-select"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select category
          </option>
          {DOCUMENT_CATEGORIES.map((cat: { id: DocumentCategoryId; label: string }) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input id="file" name="file" type="file" required accept=".pdf,image/*,.doc,.docx,.xls,.xlsx" />
      </div>
      {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
      <Button type="submit" disabled={pending} data-testid="doc-upload-submit" size="sm">
        {pending ? 'Uploading…' : 'Upload document'}
      </Button>
    </form>
  );
}
