'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Status = { message: string; ok?: boolean };

export default function TestDataControls() {
  const [status, setStatus] = useState<Status>({ message: 'Idle' });
  const [loading, setLoading] = useState<string | null>(null);

  const runAction = async (action: 'reset' | 'seed') => {
    setLoading(action);
    setStatus({ message: 'Running…' });
    try {
      const res = await fetch(`/api/test/${action}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus({ message: json.error || 'Failed', ok: false });
      } else {
        setStatus({ message: JSON.stringify(json), ok: true });
      }
    } catch (error) {
      setStatus({ message: 'Error running action', ok: false });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          onClick={() => runAction('reset')}
          disabled={loading === 'reset'}
          data-testid="dev-test-reset-button"
        >
          {loading === 'reset' ? 'Resetting…' : 'Reset test data'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => runAction('seed')}
          disabled={loading === 'seed'}
          data-testid="dev-test-seed-button"
        >
          {loading === 'seed' ? 'Seeding…' : 'Seed demo data'}
        </Button>
      </div>
      <div
        className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground"
        data-testid="dev-test-status"
      >
        {status.message}
      </div>
    </div>
  );
}
