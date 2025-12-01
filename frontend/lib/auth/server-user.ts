import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { ServerUserSession } from '@/types/auth';

const ROLE_PRIORITY: ServerUserSession['primary_role'][] = ['admin', 'owner', 'editor', 'viewer'];

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

  const { data: stakeholderRows } = await supabase
    .from('property_stakeholders')
    .select('property_id, role, deleted_at, expires_at')
    .eq('user_id', authUser.id)
    .is('deleted_at', null)
    .or('expires_at.is.null,expires_at.gt.now()');

  const property_roles: Record<string, 'owner' | 'editor' | 'viewer'> = {};
  (stakeholderRows ?? []).forEach((row) => {
    property_roles[row.property_id] = row.role as 'owner' | 'editor' | 'viewer';
  });

  const isAdmin = userRow.primary_role === 'admin';

  // Choose the strongest role: admin > owner > editor > viewer
  const primary_role =
    (ROLE_PRIORITY.find((r) => r === userRow.primary_role) as ServerUserSession['primary_role']) || 'viewer';

  return {
    id: userRow.id,
    email: userRow.email ?? null,
    full_name: userRow.full_name ?? null,
    primary_role,
    property_roles,
    isAdmin,
  };
}
