'use client';

import { QueryProvider } from '@/providers/query-provider';
import SupabaseProvider from '@/providers/supabase-provider';
import type { ReactNode } from 'react';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SupabaseProvider>
      <QueryProvider>{children}</QueryProvider>
    </SupabaseProvider>
  );
};
