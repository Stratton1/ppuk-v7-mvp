import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

const logAuth = (...args: unknown[]) => {
  console.info('[auth-proxy]', ...args);
};

const PROTECTED_PATHS = [
  '/dashboard',
  '/admin',
  '/properties',
  '/settings',
  '/tasks',
  '/watchlist',
  '/dev/test-users',
];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass all auth routes (GET/POST)
  if (pathname.startsWith('/auth')) {
    logAuth('bypass auth route', { pathname });
    return NextResponse.next();
  }

  const res = NextResponse.next({ request: { headers: req.headers } });
  const incomingCookieNames = req.cookies.getAll().map((c) => c.name);
  logAuth('request', { pathname, method: req.method, incomingCookieNames });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H-proxy-cookies',
      location: 'proxy.ts:request',
      message: 'Proxy request received',
      data: { pathname, method: req.method, incomingCookieNames },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  // For non-protected routes, allow through but still return the Supabase-aware response
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  if (!isProtected(pathname)) {
    return res;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H-proxy-no-session',
        location: 'proxy.ts:no-session',
        message: 'No session, redirecting',
      data: { pathname, redirectTo: redirectUrl.toString(), incomingCookieNames },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    return NextResponse.redirect(redirectUrl);
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/213ad833-5127-434d-abea-fccdfab15098', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H-proxy-session',
      location: 'proxy.ts:session-ok',
      message: 'Session detected',
      data: { pathname, hasUser: Boolean(user), incomingCookieNames },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  logAuth('session ok', { pathname, hasUser: Boolean(user) });
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/properties/:path*',
    '/settings/:path*',
    '/tasks/:path*',
    '/watchlist/:path*',
    '/dev/test-users/:path*',
  ],
};
