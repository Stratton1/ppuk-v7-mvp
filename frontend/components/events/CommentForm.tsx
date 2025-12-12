'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ActionResult } from '@/types/forms';

type CommentFormProps = {
  onSubmit: (text: string) => Promise<ActionResult>;
  inputTestId?: string;
  submitTestId?: string;
};

export function CommentForm({ onSubmit, inputTestId = 'comment-input', submitTestId = 'comment-submit' }: CommentFormProps) {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    const text = formData.get('text') as string;
    return onSubmit(text);
  }, {});

  return (
    <form className="space-y-3" action={formAction}>
      <Textarea name="text" required rows={3} placeholder="Add a comment..." data-testid={inputTestId} />
      {state?.error && <div className="text-sm text-destructive">{state.error}</div>}
      <Button type="submit" size="sm" disabled={pending} data-testid={submitTestId}>
        {pending ? 'Posting…' : 'Post comment'}
      </Button>
    </form>
  );
}
