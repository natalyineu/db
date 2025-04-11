'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './dashboard';
import { useAuth } from '@/lib/auth/auth-context';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function DataPage() {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const [pageLoadTime] = useState(Date.now());
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    if (DEBUG) {
      console.log('DataPage state:', { 
        isLoading, 
        isAuthenticated, 
        hasUser: !!user,
        authError: error,
        elapsedTime: Date.now() - pageLoadTime
      });
    }
  }, [isLoading, isAuthenticated, user, error, pageLoadTime]);

  useEffect(() => {
    // If authentication check is complete and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      if (DEBUG) console.log('No authenticated user found, redirecting to login');
      
      // Add a small delay to ensure all state updates have been processed
      const redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isLoading, isAuthenticated, router]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    // If loading takes more than 10 seconds, try a direct database approach
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        if (DEBUG) console.log('Loading timeout exceeded, attempting direct database access');
        
        if (user) {
          // Try to fetch profile directly
          fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch profile directly');
            }
            return response.json();
          })
          .then(data => {
            if (DEBUG) console.log('Direct profile fetch result:', data);
            // If profile exists, we can proceed to dashboard
            if (data && data.length > 0) {
              // Loading is done but we'll let the dashboard handle displaying the data
              
            } else {
              // No profile found, redirect to login
              router.push('/login');
            }
          })
          .catch(err => {
            if (DEBUG) console.error('Direct fetch error:', err);
            // Redirect to login on error
            router.push('/login');
          });
        } else {
          router.push('/login');
        }
      }
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, router, user]);

  // While checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">
          Verifying your account...
        </p>
      </div>
    );
  }

  // If there's an error but not related to authentication
  if (error && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-50 p-4 rounded-md max-w-md">
          <p className="text-lg text-red-600">Error loading your account</p>
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  // User is authenticated, show dashboard
  return <Dashboard />;
} 