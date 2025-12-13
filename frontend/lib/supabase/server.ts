import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Creates a Supabase client for Server Components (SSR).
 *
 * NEXT.JS 16 ARCHITECTURE:
 * - Auth is enforced by middleware (proxy.ts) BEFORE render
 * - Server Components TRUST middleware and do NOT re-check auth
 * - This client reads cookies for RLS/data access (NOT for auth enforcement)
 * - Must be awaited: `const supabase = await createClient()`
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // Server Components should not mutate cookies
        setAll() {},
      },
    }
  );
}

/**
 * Creates a Supabase client for Server Actions.
 *
 * This client CAN read/write cookies because Server Actions
 * run OUTSIDE the RSC render phase (they are POST handlers).
 *
 * Use this for: login, logout, signup, token refresh, session mutations
 */
export async function createActionClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
