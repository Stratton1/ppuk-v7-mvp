/**
 * File: admin/layout.tsx
 * Purpose: Admin layout with route protection
 */

import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';
import { AppPageHeader } from '@/components/app/AppPageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <AppPageHeader
          title="Admin Dashboard"
          description="System administration and analytics"
        />
        
        <nav className="flex gap-2 border-b pb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/users">Users</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/audit">Audit Log</Link>
          </Button>
        </nav>

        {children}
      </div>
    </AdminRouteGuard>
  );
}

