import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Dashboard from './dashboard';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function DataPage() {
  try {
    // Log the cookies for debugging
    console.log('Checking cookies in data page');
    
    // Create server client
    const supabase = await createClient();
    
    // Get session server-side
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error fetching session:', error);
    }
    
    console.log('Server-side session check:', !!session);
    
    // If no session, redirect to login
    if (!session) {
      console.log('No session found in server component, redirecting to login');
      redirect('/login');
    }
    
    console.log('Session found, rendering dashboard for user:', session.user.email);
    
    return (
      <Suspense fallback={
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      }>
        <Dashboard />
      </Suspense>
    );
  } catch (error) {
    console.error('Error in data page:', error);
    redirect('/login');
  }
} 