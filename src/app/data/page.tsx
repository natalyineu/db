'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/client-provider';
import { useRouter } from 'next/navigation';
import Dashboard from './dashboard';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function DataPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        if (DEBUG) console.log('Checking client-side session');
        
        // Get session from the browser client
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data.session) {
          if (DEBUG) console.log('No session found, redirecting to login');
          router.push('/login');
          return;
        }
        
        if (DEBUG) console.log('Session found for user:', data.session.user.email);
        setLoading(false);
      } catch (err) {
        if (DEBUG) {
          console.error('Error checking auth:', err);
        } else {
          console.error('Authentication error');
        }
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        router.push('/login');
      }
    }
    
    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
} 