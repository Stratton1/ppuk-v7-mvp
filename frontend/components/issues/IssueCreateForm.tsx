'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ISSUE_CATEGORIES, type IssueCategory, type IssueSeverity } from '@/lib/issues/types';
import type { ActionResult } from '@/types/forms';

type IssueCreateFormProps = {
  propertyId: string;
  action: (formData: FormData) => Promise<ActionResult>;
};

const severities: IssueSeverity[] = ['low', 'medium', 'high', 'critical'];

export function IssueCreateForm({ propertyId, action }: IssueCreateFormProps) {
  const [state, formAction, pending] = useActionState(async (_prevState: ActionResult, formData: FormData) => {
    return action(formData);
  }, {});

  return (
    <form className="space-y-4 rounded-lg border bg-card p-4 shadow-sm" action={formAction} data-testid="issue-create-form">
      <input type="hidden" name="propertyId" value={propertyId} />
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Describe the issue" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
            {ISSUE_CATEGORIES.map((cat: IssueCategory) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="severity">Severity</Label>
          <select
            id="severity"
            name="severity"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Select severity
            </option>
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} placeholder="Add more detail (optional)" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due date (optional)</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>

      {state?.error && <div className="text-sm text-destructive">{state.error}</div>}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Creating…' : 'Create issue'}
      </Button>
    </form>
  );
}
