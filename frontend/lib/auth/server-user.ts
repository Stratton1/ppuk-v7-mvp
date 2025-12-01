import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { RoleType, ServerUserSession } from '@/types/auth';

type UserRow = Database['public']['Tables']['users']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

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

  const { data: publicUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!publicUser) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authUser.id)
    .single();

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', authUser.id);

  const globalRoles: RoleType[] = (userRoles ?? []).flatMap((ur) => {
    const name = (ur as { roles?: { name?: unknown } }).roles?.name;
    return typeof name === 'string' ? ([name] as RoleType[]) : [];
  });

  const isAdmin = globalRoles.includes('admin');

  return {
    userId: authUser.id,
    email: authUser.email ?? '',
    emailVerified: Boolean(authUser.email_confirmed_at),
    fullName: (publicUser as UserRow).full_name ?? null,
    avatarUrl: (publicUser as UserRow).avatar_url ?? null,
    organisation: (publicUser as UserRow).organisation ?? null,
    primaryRole: ((publicUser as UserRow).primary_role as RoleType) ?? 'viewer',
    phone: (profile as ProfileRow | null)?.phone ?? null,
    bio: (profile as ProfileRow | null)?.bio ?? null,
    globalRoles,
    isAdmin,
  };
}
