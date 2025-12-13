import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PropertyPermission, PropertyStatus, ServerUserSession } from '@/types/auth';

export async function getServerClient() {
  return await createClient();
}

export async function getServerUser(): Promise<ServerUserSession | null> {
  const supabase = await getServerClient();
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

  const rawPrimaryRole = (authUser.user_metadata as Record<string, unknown> | null)?.['primary_role'];
  const baseSession: ServerUserSession = {
    id: authUser.id,
    email: authUser.email ?? null,
    full_name: authUser.user_metadata?.full_name ?? null,
    primary_role: (rawPrimaryRole as ServerUserSession['primary_role']) ?? null,
    property_roles: {},
    isAdmin: false,
  };

  if (!userRow) {
    return {
      ...baseSession,
      primary_role: baseSession.primary_role ?? null,
      isAdmin: baseSession.primary_role === 'admin',
    };
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
    email: userRow.email ?? authUser.email ?? null,
    full_name: userRow.full_name ?? baseSession.full_name ?? null,
    primary_role: userRow.primary_role ?? baseSession.primary_role ?? null,
    property_roles,
    isAdmin,
  };
}

/**
 * Enforce authentication for server components/pages.
 * Redirects to login with the provided path (or best-effort current path) if no session exists.
 */
export async function getSessionOrRedirect(options?: { redirectTo?: string }): Promise<ServerUserSession> {
  const session = await getServerUser();
  if (session) return session;

  const hdrs = await headers();
  const hintedPath =
    options?.redirectTo ??
    hdrs.get('x-pathname') ??
    hdrs.get('next-url') ??
    hdrs.get('referer') ??
    '/dashboard';
  const safePath = hintedPath?.startsWith('/') ? hintedPath : '/dashboard';

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H-server-user-redirect',
      location: 'server-user.ts:getSessionOrRedirect',
      message: 'No session, redirecting',
      data: { hintedPath: safePath },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  console.info('[auth-session]', 'no session, redirecting', { hintedPath: safePath });
  redirect(`/auth/login?redirect=${encodeURIComponent(safePath)}`);
}
