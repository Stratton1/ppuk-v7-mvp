/**
 * Supabase client for PUBLIC routes (auth pages, public passport, etc.)
 *
 * This client:
 * - Has full .auth access
 * - Can read cookies (to check if user is already logged in)
 * - Does NOT enforce auth
 * - Is safe on public routes that aren't protected by middleware
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export async function createPublicClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // Public routes should not mutate cookies
        setAll() {},
      },
    }
  );
}
