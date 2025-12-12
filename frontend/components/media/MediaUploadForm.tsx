'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/types/forms';

type MediaUploadFormProps = {
  propertyId: string;
  action: (formData: FormData) => Promise<ActionResult>;
};

export function MediaUploadForm({ propertyId, action }: MediaUploadFormProps) {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    return action(formData);
  }, {});

  return (
    <form
      className="space-y-4 rounded-lg border bg-card p-4"
      data-testid="media-upload-form"
      action={formAction}
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          name="category"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select category
          </option>
          <option value="photos">Photos</option>
          <option value="floorplans">Floorplans</option>
          <option value="videos">Videos</option>
          <option value="tours">Tours</option>
          <option value="brochures">Brochures</option>
          <option value="drone">Drone</option>
          <option value="misc">Misc</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Media file</Label>
        <Input id="file" name="file" type="file" required accept="image/*,video/*" />
      </div>
      {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Uploading…' : 'Upload media'}
      </Button>
    </form>
  );
}
