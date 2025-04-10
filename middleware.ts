import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Only apply middleware to /data routes, allow debug route
  if (req.nextUrl.pathname === '/debug' || !req.nextUrl.pathname.startsWith('/data')) {
    return NextResponse.next();
  }

  // Create a response object
  const res = NextResponse.next();
  
  // Log request details
  console.log(`Middleware processing request for: ${req.nextUrl.pathname}`);
  console.log(`Request headers:`, Object.fromEntries([...req.headers.entries()]));
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          console.log(`Looking for cookie: ${name}`);
          const cookie = req.cookies.get(name);
          console.log(`Cookie ${name} found:`, !!cookie);
          return cookie?.value;
        },
        set(name, value, options) {
          console.log(`Setting cookie: ${name}`);
          res.cookies.set({
            name,
            value,
            ...options,
            secure: true,
            sameSite: 'lax',
            httpOnly: true,
            path: '/',
            // Don't set domain to allow it to work on both localhost and production domain
          });
        },
        remove(name, options) {
          console.log(`Removing cookie: ${name}`);
          res.cookies.set({
            name,
            value: '',
            ...options,
            secure: true,
            sameSite: 'lax',
            httpOnly: true,
            maxAge: 0,
            path: '/',
            // Don't set domain to allow it to work on both localhost and production domain
          });
        },
      },
    }
  );
  
  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`Middleware for ${req.nextUrl.pathname}, session exists:`, !!session);
    
    // If accessing /data route and no session, redirect to login
    if (req.nextUrl.pathname.startsWith('/data') && !session) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // If session exists, add user info to request
    if (session) {
      console.log('Session found for user:', session.user.email);
      res.headers.set('x-user-id', session.user.id);
    }
    
    return res;
  } catch (error) {
    console.error('Error in middleware:', error);
    // On error, allow the request to continue
    return res;
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: ['/data/:path*', '/debug'],
}; 