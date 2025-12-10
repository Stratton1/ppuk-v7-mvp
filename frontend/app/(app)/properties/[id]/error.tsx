/**
 * File: properties/[id]/error.tsx
 * Purpose: Error state for property detail page
 * Type: Client Component (required for error boundaries)
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropertyDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (or external service)
    console.error('Property detail error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Failed to load property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We could not load this property. It may not exist or there was a server error.
            </p>
            {error.message && <p className="text-xs text-muted-foreground">Error: {error.message}</p>}
            <div className="flex gap-2">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/properties')}>
                Back to properties
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
