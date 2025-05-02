import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Check for required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required Supabase environment variables');
}

// Singleton instances
let browserClient: SupabaseClient | null = null;

/**
 * Creates a standard Supabase client for client-side usage
 * Uses a singleton pattern to prevent multiple instances
 */
export const createBrowserClient = () => {
  // Return existing instance if available in browser environment
  if (typeof window !== 'undefined' && browserClient) {
    return browserClient;
  }
  
  // Create a new instance
  const client = createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
  
  // Store the instance in browser environments
  if (typeof window !== 'undefined') {
    browserClient = client;
  }
  
  return client;
};

/**
 * Creates a Supabase client for server components
 */
export const createServerClient = () => {
  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
};

/**
 * Creates a Supabase admin client with service role permissions
 * IMPORTANT: Only use server-side; never expose in client code
 */
export const createAdminClient = () => {
  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}; 