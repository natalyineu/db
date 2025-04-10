import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for server components with proper cookie handling
 */
export const createClient = async () => {
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
          // This is a server component, we may need to handle cookies in the future
        },
        remove(name, options) {
          // This is a server component, we may need to handle cookies in the future
        },
      },
    }
  );
}; 