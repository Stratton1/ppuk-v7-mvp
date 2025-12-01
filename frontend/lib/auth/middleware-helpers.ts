const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
];

export function isAllowedPublicRoute(pathname: string): boolean {
  if (pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/assets')) return true;
  if (pathname.startsWith('/public')) return true;
  if (pathname.startsWith('/favicon')) return true;
  if (pathname.match(/\\.(png|jpg|jpeg|gif|svg|ico|txt|xml)$/)) return true;
  return PUBLIC_PATHS.includes(pathname);
}

export function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/properties') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    isAdminRoute(pathname)
  );
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export function isPropertyRoute(pathname: string): boolean {
  return pathname.startsWith('/properties/');
}

export function extractPropertyId(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  const idx = segments.indexOf('properties');
  if (idx !== -1 && segments[idx + 1]) {
    return segments[idx + 1];
  }
  return null;
}
