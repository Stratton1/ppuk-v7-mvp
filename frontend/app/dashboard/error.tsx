'use client';

import React from 'react';

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function DashboardError({ error, reset }: ErrorProps): React.ReactElement {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <div className="mb-2 font-semibold">Dashboard failed to load.</div>
        <div className="mb-3 text-xs text-destructive/80">{error.message}</div>
        <button
          type="button"
          onClick={reset}
          className="rounded bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
