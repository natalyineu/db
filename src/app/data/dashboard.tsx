"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function Dashboard() {
  const { profile, signOut, isLoading, refreshProfile, error: authError, isAuthenticated, user } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const router = useRouter();

  // Log authentication state changes for debugging
  useEffect(() => {
    if (DEBUG) {
      console.log('Auth state in dashboard:', { 
        isLoading, 
        isAuthenticated, 
        hasProfile: !!profile, 
        hasUser: !!user,
        authError,
        retryCount
      });
    }
    
    // If auth is done loading but no authentication, redirect to login
    if (!isLoading && !isAuthenticated) {
      if (DEBUG) console.log('Not authenticated, redirecting to login');
      router.push('/login');
    }
    
    // Once authentication is complete, update local loading state
    if (!isLoading) {
      setLocalLoading(false);
    }
  }, [isLoading, isAuthenticated, profile, user, authError, router, retryCount]);

  // If authenticated but profile is missing, retry a few times
  useEffect(() => {
    if (!isLoading && isAuthenticated && !profile && retryCount < 3) {
      if (DEBUG) console.log(`No profile found, will retry (${retryCount + 1}/3)`);
      const timer = setTimeout(() => {
        if (DEBUG) console.log(`Retrying profile fetch (attempt ${retryCount + 1}/3)`);
        refreshProfile();
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
    
    // If we've retried 3 times and still no profile, show error
    if (!isLoading && isAuthenticated && !profile && retryCount >= 3) {
      if (DEBUG) console.log('Maximum retry attempts reached, showing error');
      setLocalError('Unable to load your profile after multiple attempts. Please try again later.');
      
      // Direct profile fetch attempt
      if (user) {
        if (DEBUG) console.log('Making direct database call to profiles table');
        
        // Use browser fetch directly instead of Supabase client
        fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
          }
        })
        .then(response => {
          if (!response.ok) throw new Error(`Profile fetch failed: ${response.statusText}`);
          return response.json();
        })
        .then(data => {
          if (DEBUG) console.log('Direct profile fetch result:', data);
          if (data && data.length > 0) {
            const profileData = data[0];
            // Create local profile state since the auth context is having issues
            const userProfile = {
              id: profileData.id,
              email: profileData.email || user.email || 'user@example.com',
              created_at: profileData.created_at || new Date().toISOString(),
              updated_at: profileData.updated_at
            };
            
            // Set as local component state since we can't update auth context
            setLocalProfile(userProfile);
            setLocalError(null);
            setLocalLoading(false);
            
            if (DEBUG) console.log('Created local profile state:', userProfile);
          }
        })
        .catch(error => {
          if (DEBUG) console.error('Direct profile fetch error:', error);
          setLocalError(`Profile fetch error: ${error.message}`);
        });
      }
    }
  }, [isLoading, isAuthenticated, profile, user, refreshProfile, retryCount]);

  const handleSignOut = async () => {
    try {
      setLocalLoading(true);
      await signOut();
      router.push('/');
    } catch (error) {
      if (DEBUG) console.error('Error signing out:', error);
      setLocalLoading(false);
    }
  };

  const handleRetry = () => {
    setLocalLoading(true);
    setLocalError(null);
    setRetryCount(0);
    refreshProfile();
    setTimeout(() => setLocalLoading(false), 500);
  };

  // Show loading state
  if (isLoading || localLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading dashboard...</p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-gray-500">Attempt {retryCount}/3...</p>
          )}
        </div>
      </main>
    );
  }

  // Show error state if we have an error or no profile
  if (localError || authError || (!profile && !localProfile && isAuthenticated && !isLoading && !localLoading)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-600">
              {localError || authError || "Unable to load your profile data"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {retryCount >= 3 ? 'Maximum retry attempts reached.' : ''}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRetry}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Show dashboard if we have profile data (either from auth context or local state)
  const displayProfile = profile || localProfile;
  if (displayProfile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Personal Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your account</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium text-gray-900">User Information</h2>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900">{displayProfile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Account Created:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(displayProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
                {displayProfile.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(displayProfile.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={handleSignOut}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Fallback - should never reach this point with proper state handling
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <p className="text-lg text-red-600">Something went wrong. Please try again.</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Login
        </button>
      </div>
    </main>
  );
} 