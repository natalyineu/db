import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Dashboard from './dashboard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DataPage() {
  // Create server client
  const supabase = await createClient();
  
  // Get session server-side
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    redirect('/login');
  }
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
} 