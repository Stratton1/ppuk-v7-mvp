import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase client for Server Components (SSR).
 * This client is READ-ONLY for cookies - it cannot set or remove cookies.
 * Cookie mutations are handled by proxy.ts (middleware-style) before SSR.
 *
 * IMPORTANT: Do NOT use this client in Server Actions that need to modify auth state.
 * Use createActionClient() for that purpose.
 */
export function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieStore = cookies();
          return cookieStore.getAll();
        },
        setAll() {
          // NO-OP: Cookie mutations are not allowed in Server Components.
          // Auth token refresh is handled by proxy.ts
          // This prevents the "Cookies can only be modified in a Server Action or Route Handler" error.
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for Server Actions.
 * This client CAN set and remove cookies (allowed in Server Actions).
 * Use this for login, logout, and other auth state changes.
 */
export function createActionClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieStore = cookies();
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          const cookieStore = cookies();
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
