import { NextResponse } from 'next/server';
import { runSearch } from '@/lib/search/engine';
import { getServerUser } from '@/lib/auth/server-user';
import type { DashboardRole } from '@/lib/roles/domain';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('q') ?? undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '5');
  const user = await getServerUser();
  const role: DashboardRole = user?.isAdmin
    ? 'admin'
    : user?.primary_role === 'agent'
    ? 'agent'
    : user?.primary_role === 'conveyancer'
    ? 'conveyancer'
    : user && Object.values(user.property_roles || {}).some((r) => r.status.includes('owner'))
    ? 'owner'
    : 'buyer';

  try {
    const results = await runSearch({ text, page, pageSize, role, userId: user?.id ?? null });
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
