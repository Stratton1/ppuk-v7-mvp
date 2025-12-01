import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const store = cookies() as unknown as { get: (name: string) => { value?: string } | string | undefined };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = store.get(name);
          if (!value) return undefined;
          return typeof value === 'string' ? value : value.value;
        },
        set() {
          // no-op for SSR helpers
        },
        remove() {
          // no-op for SSR helpers
        },
      },
    }
  );
}
