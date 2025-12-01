import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/auth/server-user';
import { canEditProperty, canViewProperty, isAdmin } from '@/lib/role-utils';

const PUBLIC_PATHS = ['/auth/login', '/auth/register'];
const PUBLIC_PREFIXES = ['/p/', '/assets/', '/favicon.ico', '/_next/'];
const PROTECTED_PATHS = ['/dashboard'];
const PROTECTED_PREFIXES = ['/properties/', '/api/property-access/'];

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  );
}

function isProtected(pathname: string) {
  if (PROTECTED_PATHS.includes(pathname)) return true;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

function getPropertyId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const idx = segments.indexOf('properties');
  if (idx !== -1 && segments[idx + 1]) return segments[idx + 1];
  return null;
}

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const session = await getServerUser();
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
    return NextResponse.redirect(url);
  }

  const supabase = createClient();
  const admin = isAdmin(session);

  // Property-scoped checks
  const propertyId = getPropertyId(pathname);
  if (propertyId) {
    const editing = pathname.includes('/edit');
    const { data: property } = await supabase
      .from('properties')
      .select('public_visibility')
      .eq('id', propertyId)
      .maybeSingle();
    const isPublic = property?.public_visibility ?? false;
    const ok = admin
      ? true
      : editing
      ? canEditProperty(session, propertyId)
      : canViewProperty(session, propertyId, { isPublic });
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'no-access');
      return NextResponse.redirect(url);
    }
  }

  // API property-access check
  if (pathname.startsWith('/api/property-access/')) {
    const pid = pathname.split('/').filter(Boolean).pop();
    if (!pid) return NextResponse.json({ access: false }, { status: 403 });
    const { data: property } = await supabase
      .from('properties')
      .select('public_visibility')
      .eq('id', pid)
      .maybeSingle();
    const isPublic = property?.public_visibility ?? false;
    const ok = admin ? true : canViewProperty(session, pid, { isPublic });
    if (!ok) return NextResponse.json({ access: false }, { status: 403 });
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
