import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

// Enable debugging only in development environment
const DEBUG = process.env.NODE_ENV !== 'production';

// Constants for Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a singleton instance for browser environments
let supabaseInstance: SupabaseClient | null = null;

/**
 * Creates a Supabase client with the given options.
 * Returns the same instance on subsequent calls in browser environments.
 * 
 * @param options - Additional options to pass to the Supabase client
 * @returns Supabase client instance
 */
export function createBrowserClient(options = {}) {
  if (typeof window !== 'undefined') {
    // Return the existing instance if we're in a browser
    if (supabaseInstance) return supabaseInstance;
  }

  // Create a new instance
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    ...options,
  });

  // Save the instance in browser environments
  if (typeof window !== 'undefined') {
    supabaseInstance = client;
  }

  return client;
}

interface Cookies {
  get: (name: string) => { value?: string } | undefined;
}

/**
 * Creates a fresh Supabase client for server environments
 * 
 * @param cookies - Optional cookies for authenticated requests
 * @returns Supabase client instance
 */
export function createServerClient(cookies: Cookies | null = null) {
  const options: Record<string, any> = {};

  // Add auth token from cookies if available
  if (cookies) {
    const authToken = cookies.get('sb-auth-token')?.value;
    if (authToken) {
      options.global = {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };
    }
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}

export default createBrowserClient; 