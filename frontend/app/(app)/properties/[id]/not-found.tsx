/**
 * File: properties/[id]/not-found.tsx
 * Purpose: 404 page for property not found
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropertyNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The property you are looking for does not exist or has been removed from the system.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/properties">Browse properties</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
