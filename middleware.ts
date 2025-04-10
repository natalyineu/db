import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next();
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
            secure: process.env.NODE_ENV === 'production', // Only use secure in production
            sameSite: 'lax',
            httpOnly: true,
          });
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            secure: process.env.NODE_ENV === 'production', // Only use secure in production
            sameSite: 'lax',
            httpOnly: true,
            maxAge: 0,
          });
        },
      },
    }
  );
  
  // Refresh the session
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log("Middleware checking session for path:", req.nextUrl.pathname);
  console.log("Session exists:", !!session);
  
  // Check authentication for protected routes
  const isAuthRoute = req.nextUrl.pathname.startsWith('/data');
  
  if (isAuthRoute && !session) {
    // Redirect unauthenticated users to login page
    console.log("No session found, redirecting to login");
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Add session data to request headers for server components
  if (session) {
    console.log("Session found, user ID:", session.user.id);
    res.headers.set('x-auth-user-id', session.user.id);
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 