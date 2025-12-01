import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  extractPropertyId,
  isAdminRoute,
  isAllowedPublicRoute,
  isPropertyRoute,
  isProtectedRoute,
} from '@/lib/auth/middleware-helpers';

async function checkUserIsAdmin(userId: string, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId);
  const roles = (data ?? []).flatMap((row) => {
    const name = (row as { roles?: { name?: unknown } }).roles?.name;
    return typeof name === 'string' ? [name] : [];
  });
  return roles.includes('admin');
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  if (isAllowedPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedRoute(pathname)) {
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/auth')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (isAdminRoute(pathname)) {
    const isAdmin = await checkUserIsAdmin(user.id, supabase);
    if (!isAdmin) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (isPropertyRoute(pathname)) {
    const propertyId = extractPropertyId(pathname);
    if (propertyId) {
      const accessUrl = `${req.nextUrl.origin}/api/property-access/${propertyId}`;
      const res = await fetch(accessUrl, {
        headers: {
          cookie: req.headers.get('cookie') ?? '',
        },
      });
      const { access } = (await res.json()) as { access: boolean };
      if (!access) {
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'no-access');
        return NextResponse.redirect(url);
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  if (user.email) {
    response.headers.set('x-user-email', user.email);
  }
  return response;
}
