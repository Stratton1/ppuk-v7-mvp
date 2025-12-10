import { createClient } from '@/lib/supabase/server';
import type { PropertyPermission, PropertyStatus, ServerUserSession } from '@/types/auth';

export function getServerClient() {
  return createClient();
}

export async function getServerUser(): Promise<ServerUserSession | null> {
  const supabase = getServerClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('id, email, full_name, primary_role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!userRow) {
    return null;
  }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('phone, bio')
    .eq('user_id', authUser.id)
    .maybeSingle();
  void profileRow;

  const { data: stakeholderRows } = await supabase
    .from('property_stakeholders')
    .select('property_id, status, permission, deleted_at, expires_at')
    .eq('user_id', authUser.id)
    .is('deleted_at', null)
    .or('expires_at.is.null,expires_at.gt.now()');

  const property_roles: Record<string, { status: PropertyStatus[]; permission: PropertyPermission | null }> = {};
  (stakeholderRows ?? []).forEach((row) => {
    const current = property_roles[row.property_id] ?? { status: [] as PropertyStatus[], permission: null };
    if (row.status && !current.status.includes(row.status as PropertyStatus)) {
      current.status.push(row.status as PropertyStatus);
    }
    if (row.permission === 'editor') {
      current.permission = 'editor';
    } else if (row.permission === 'viewer' && current.permission !== 'editor') {
      current.permission = 'viewer';
    }
    property_roles[row.property_id] = current;
  });

  const { data: ownedProperties } = await supabase
    .from('properties')
    .select('id')
    .eq('created_by_user_id', authUser.id)
    .is('deleted_at', null);

  (ownedProperties ?? []).forEach((property) => {
    const current = property_roles[property.id] ?? { status: [] as PropertyStatus[], permission: null };
    if (!current.status.includes('owner')) {
      current.status.push('owner');
    }
    if (current.permission !== 'editor') {
      current.permission = 'editor';
    }
    property_roles[property.id] = current;
  });

  const isAdmin = userRow.primary_role === 'admin';

  return {
    id: userRow.id,
    email: userRow.email ?? null,
    full_name: userRow.full_name ?? null,
    primary_role: userRow.primary_role ?? null,
    property_roles,
    isAdmin,
  };
}
