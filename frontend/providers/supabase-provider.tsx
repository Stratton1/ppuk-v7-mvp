'use client';

import { createContext, useContext, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export const SupabaseContext = createContext<SupabaseClient | null>(null);

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState<SupabaseClient>(() => createClient());
  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>;
}

export const useSupabase = (): SupabaseClient => {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return supabase;
};
