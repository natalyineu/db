import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase server client
 */
export const createClient = async () => {
  // Create a standard Supabase client for server components
  // Session handling is managed by middleware
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}; 