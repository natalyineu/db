import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

// Create a Supabase client for client-side rendering
export const createBrowserClient = () => 
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Create a Supabase client for server-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create a server-side Supabase client with cookie support
export async function createServerSupabaseClient() {
  // Dynamically import cookies to avoid issues with client components
  const { cookies } = await import('next/headers');
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // This is a server component, we only read cookies here
        },
        remove(name, options) {
          // This is a server component, we only read cookies here
        },
      },
    }
  );
} 