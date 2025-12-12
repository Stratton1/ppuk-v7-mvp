'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MockUsersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mock users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Mock Supabase mode has been removed. This page is disabled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
