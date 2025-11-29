import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Using console.warn to avoid throwing during static builds; runtime should supply env vars.
  console.warn('Supabase environment variables are not fully set. Please update .env.local.');
}

export const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }
  return createSupabaseJsClient(supabaseUrl, supabaseAnonKey);
};

// Alias exported for server components convenience.
export const createClient = createSupabaseClient;
