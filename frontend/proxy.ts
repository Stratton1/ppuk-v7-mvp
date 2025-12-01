import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

async function isAdmin(userId: string, supabase: ReturnType<typeof createClient>) {
  const { data } = await supabase
    .from('users')
    .select('primary_role')
    .eq('id', userId)
    .maybeSingle();
  return data?.primary_role === 'admin';
}

async function canViewProperty(
  propertyId: string,
  supabase: ReturnType<typeof createClient>,
  userId?: string | null
) {
  const { data: property } = await supabase
    .from('properties')
    .select('id, public_visibility, created_by_user_id')
    .eq('id', propertyId)
    .maybeSingle();

  if (!property) return false;
  if (property.public_visibility) return true;
  if (!userId) return false;
  if (property.created_by_user_id === userId) return true;

  const { data: hasRole } = await supabase.rpc('has_property_role', {
    property_id: propertyId,
    allowed_roles: ['owner', 'editor', 'viewer'],
  });

  return Boolean(hasRole);
}

async function canEditProperty(
  propertyId: string,
  supabase: ReturnType<typeof createClient>,
  userId?: string | null
) {
  if (!userId) return false;

  const { data: property } = await supabase
    .from('properties')
    .select('id, created_by_user_id')
    .eq('id', propertyId)
    .maybeSingle();

  if (property?.created_by_user_id === userId) return true;

  const { data: hasRole } = await supabase.rpc('has_property_role', {
    property_id: propertyId,
    allowed_roles: ['owner', 'editor'],
  });

  return Boolean(hasRole);
}

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
    return NextResponse.redirect(url);
  }

  const admin = await isAdmin(user.id, supabase);

  // Property-scoped checks
  const propertyId = getPropertyId(pathname);
  if (propertyId) {
    const editing = pathname.includes('/edit');
    if (!admin) {
      const ok = editing
        ? await canEditProperty(propertyId, supabase, user.id)
        : await canViewProperty(propertyId, supabase, user.id);
      if (!ok) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'no-access');
        return NextResponse.redirect(url);
      }
    }
  }

  // API property-access check
  if (pathname.startsWith('/api/property-access/')) {
    if (admin) return NextResponse.next();
    const pid = pathname.split('/').filter(Boolean).pop();
    if (!pid) return NextResponse.json({ access: false }, { status: 403 });
    const ok = await canViewProperty(pid, supabase, user.id);
    if (!ok) return NextResponse.json({ access: false }, { status: 403 });
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
