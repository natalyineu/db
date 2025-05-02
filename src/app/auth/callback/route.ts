export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get('next') || '/login';
  const code = request.nextUrl.searchParams.get('code');
  
  // If there's no code, it's not a proper auth callback
  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Redirect to the specified path or default to login
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    // Redirect to login page with error
    return NextResponse.redirect(
      new URL(`/login?error=Auth%20callback%20failed`, request.url)
    );
  }
} 