"use client";

import { useContext } from 'react';
import { SupabaseContext } from '@/providers/supabase-provider';

export function useSupabase() {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return supabase;
}
