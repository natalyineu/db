'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './dashboard';
import { useAuth } from '@/lib/auth/auth-context';
import './loading-animation.css';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function DataPage() {
  const { isAuthenticated, isLoading, user, error, refreshProfile } = useAuth();
  const [pageLoadTime] = useState(Date.now());
  const [isRetrying, setIsRetrying] = useState(false);
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
    // If loading takes more than 8 seconds, try a direct API approach via server
    const timeoutId = setTimeout(() => {
      if (isLoading && user) {
        if (DEBUG) console.log('Loading timeout exceeded, attempting API fallback');
        
        // Use the server API instead of direct database access
        fetch(`/api/get-profile-direct?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch profile via API');
          }
          return response.json();
        })
        .then(data => {
          if (DEBUG) console.log('API profile fetch result:', data);
          // If profile exists, we can proceed to dashboard
          if (data && data.profile) {
            // Loading is done but we'll let the dashboard handle displaying the data
          } else {
            // No profile found, redirect to login
            router.push('/login');
          }
        })
        .catch(err => {
          if (DEBUG) console.error('API fetch error:', err);
          // Redirect to login on error
          router.push('/login');
        });
      } else if (isLoading) {
        // No user available, redirect to login
        router.push('/login');
      }
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, router, user]);

  // Handle manual retry
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refreshProfile();
      // Wait a moment for state to update
      setTimeout(() => setIsRetrying(false), 1000);
    } catch (e) {
      setIsRetrying(false);
    }
  };

  // While checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        {/* Custom animated loading spinner */}
        <div className="loading-spinner mb-6 float-animation">
          <div className="inner one"></div>
          <div className="inner two"></div>
        </div>
        
        {/* Animated text */}
        <p className="text-lg text-gray-600 float-animation delay-100">Loading dashboard</p>
        <div className="mt-4 flex items-center justify-center">
          <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 
                  pulse-border-animation flex items-center">
            <span>Verifying your account</span>
            <span className="ml-1 inline-flex">
              <span className="animate-bounce mx-0.5">.</span>
              <span className="animate-bounce mx-0.5 delay-100">.</span>
              <span className="animate-bounce mx-0.5 delay-200">.</span>
            </span>
          </div>
        </div>
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
          <div className="mt-4 flex justify-center space-x-4">
            <button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
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
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="loading-spinner mb-6 float-animation">
          <div className="inner one"></div>
        </div>
        <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 
                pulse-border-animation flex items-center">
          <span>Redirecting to login</span>
          <span className="ml-1 inline-flex">
            <span className="animate-bounce mx-0.5">.</span>
            <span className="animate-bounce mx-0.5 delay-100">.</span>
            <span className="animate-bounce mx-0.5 delay-200">.</span>
          </span>
        </div>
      </div>
    );
  }

  // User is authenticated, show dashboard
  return <Dashboard />;
} 