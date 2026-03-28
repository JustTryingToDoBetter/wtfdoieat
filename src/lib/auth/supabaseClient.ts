import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!url || !anonKey) {
  // keep runtime warning only in dev; app still works with static mode
  if (import.meta.env.DEV) {
    console.warn('[auth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
