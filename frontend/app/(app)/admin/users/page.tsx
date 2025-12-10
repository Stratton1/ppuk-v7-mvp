/**
 * File: admin/users/page.tsx
 * Purpose: User management page for admins
 */

import { createClient } from '@/lib/supabase/server';
import { AppSection } from '@/components/app/AppSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Database } from '@/types/supabase';

type AdminUser = Database['public']['Functions']['get_admin_users']['Returns'][number];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  // Fetch users
  const { data: users, error } = await supabase.rpc('get_admin_users', {
    limit_count: limit,
    offset_count: offset,
  });

  if (error) {
    console.error('Admin users fetch error:', error);
  }

  const usersList = (users as AdminUser[] | null) || [];

  return (
    <AppSection title="User Management">
      {usersList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left text-sm font-medium">Email</th>
                  <th className="p-4 text-left text-sm font-medium">Name</th>
                  <th className="p-4 text-left text-sm font-medium">Role</th>
                  <th className="p-4 text-left text-sm font-medium">Properties</th>
                  <th className="p-4 text-left text-sm font-medium">Created</th>
                  <th className="p-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{user.email}</div>
                    </td>
                    <td className="p-4">{user.full_name || '—'}</td>
                    <td className="p-4">
                      <Badge variant={user.primary_role === 'admin' ? 'default' : 'secondary'}>
                        {user.primary_role}
                      </Badge>
                    </td>
                    <td className="p-4">{user.properties_count}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/users/${user.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1}-{offset + usersList.length} of users
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/users?page=${page - 1}`}>Previous</Link>
                </Button>
              )}
              {usersList.length === limit && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/users?page=${page + 1}`}>Next</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppSection>
  );
}

