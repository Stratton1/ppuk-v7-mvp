/**
 * File: properties/error.tsx
 * Purpose: Error state for properties page
 * Type: Client Component (required for error boundaries)
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (or external service)
    console.error('Properties page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Failed to load the properties list. This could be due to a network issue or server error.
            </p>
            {error.message && (
              <p className="text-xs text-muted-foreground">Error: {error.message}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Go home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
