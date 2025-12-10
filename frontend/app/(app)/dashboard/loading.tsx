'use client';

import React from 'react';
import { PropertyCardSkeleton } from '@/components/property/property-card';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-2xl bg-muted/40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="rounded-2xl">
            <CardContent className="space-y-3 py-6">
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <PropertyCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
