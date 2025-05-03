import { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { 
  createBrowserClient as clientBrowserClient,
  createServerClient as clientServerClient,
  createAdminClient as clientAdminClient
} from './supabase/client';

// Enable debugging only in development environment
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Re-export the client functions for backward compatibility
 * These exports ensure existing imports don't break
 */
export const createBrowserClient = clientBrowserClient;
export const createServerClient = clientServerClient;
export const createAdminClient = clientAdminClient;

/**
 * Legacy server client with cookies support 
 * Maintained for backward compatibility
 */
interface Cookies {
  get: (name: string) => { value?: string } | undefined;
}

/**
 * Legacy server client with cookies
 * @deprecated Use createServerClient from @/lib/supabase/client instead
 */
export function createServerClientWithCookies(cookies: Cookies | null = null) {
  const client = clientServerClient();
  
  // Add auth token from cookies if available
  if (cookies) {
    const authToken = cookies.get('sb-auth-token')?.value;
    if (authToken && DEBUG) {
      console.log('Found auth token in cookies');
    }
  }
  
  return client;
}

// Default export for backward compatibility
export default createBrowserClient; 