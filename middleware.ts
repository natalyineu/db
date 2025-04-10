import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For development and debugging - only enable in development environment
const BYPASS_AUTH = false;
const DEBUG = process.env.NODE_ENV !== 'production';

export async function middleware(req: NextRequest) {
  // Only apply middleware to /data routes, allow debug route
  if (req.nextUrl.pathname === '/debug' || !req.nextUrl.pathname.startsWith('/data')) {
    return NextResponse.next();
  }

  if (DEBUG) console.log(`Middleware processing request for: ${req.nextUrl.pathname}`);
  
  // ⚠️ BYPASS AUTH for debugging - REMOVE THIS IN PRODUCTION
  if (BYPASS_AUTH) {
    console.log('⚠️ BYPASSING AUTHENTICATION FOR DEBUGGING');
    return NextResponse.next();
  }

  // Create a response object
  const res = NextResponse.next();
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          if (DEBUG) console.log(`Looking for cookie: ${name}`);
          const cookie = req.cookies.get(name);
          if (DEBUG) console.log(`Cookie ${name} found:`, !!cookie);
          return cookie?.value;
        },
        set(name, value, options) {
          if (DEBUG) console.log(`Setting cookie: ${name}`);
          res.cookies.set({
            name,
            value,
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true, // Set httpOnly to true for better security
            path: '/',
          });
        },
        remove(name, options) {
          if (DEBUG) console.log(`Removing cookie: ${name}`);
          res.cookies.set({
            name,
            value: '',
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: true, // Set httpOnly to true for better security
            maxAge: 0,
            path: '/',
          });
        },
      },
    }
  );
  
  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();
    if (DEBUG) console.log(`Middleware for ${req.nextUrl.pathname}, session exists:`, !!session);
    
    // If accessing /data route and no session, redirect to login
    if (req.nextUrl.pathname.startsWith('/data') && !session) {
      if (DEBUG) console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // If session exists, add user info to request and refresh the session if needed
    if (session) {
      if (DEBUG) console.log('Session found for user:', session.user.email);
      res.headers.set('x-user-id', session.user.id);
      
      // Refresh the session so the cookies are constantly updated
      await supabase.auth.setSession(session);
    }
    
    return res;
  } catch (error) {
    // Log errors safely without exposing sensitive details in production
    if (DEBUG) {
      console.error('Middleware error:', error);
    } else {
      console.error('Authentication middleware error');
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Only run middleware on specific paths
export const config = {
  matcher: ['/data/:path*', '/debug'],
}; 