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
  const [localError, setLocalError] = useState<string | null>(null);
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

  // Force a direct redirect to login using window.location instead of router
  // This is guaranteed to work even if router context is broken
  const forceRedirectToLogin = () => {
    try {
      // Try to use the router if available
      router.push('/login');
      
      // As a guarantee, also set a timer to force redirect with window.location
      setTimeout(() => {
        window.location.href = '/login';
      }, 200);
    } catch (error) {
      // If router fails, immediately use direct browser navigation
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    // If authentication check is complete and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      if (DEBUG) console.log('No authenticated user found, redirecting to login');
      forceRedirectToLogin();
    }
  }, [isLoading, isAuthenticated]);

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
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch profile via API: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (DEBUG) console.log('API profile fetch result:', data);
          // If profile exists, we can proceed to dashboard
          if (data && data.profile) {
            // Loading is done but we'll let the dashboard handle displaying the data
            setLocalError(null);
          } else {
            // No profile found, set error
            setLocalError('Profile could not be loaded');
          }
        })
        .catch(err => {
          if (DEBUG) console.error('API fetch error:', err);
          setLocalError(err.message || 'Error loading profile');
        });
      } else if (isLoading) {
        // No user available, redirect to login
        forceRedirectToLogin();
      }
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, user]);

  // Handle manual retry
  const handleRetry = async () => {
    setIsRetrying(true);
    setLocalError(null);
    
    try {
      if (user) {
        // Direct fetch through API
        const response = await fetch(`/api/get-profile-direct?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile via API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.profile) {
          // Profile loaded, now refresh auth context
          await refreshProfile();
        } else {
          throw new Error('Profile could not be loaded');
        }
      } else {
        // Try to refresh profile through auth context
        await refreshProfile();
      }
      
      // Wait a moment for state to update
      setTimeout(() => setIsRetrying(false), 1000);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Failed to load profile');
      setIsRetrying(false);
    }
  };

  // Emergency logout and redirect to login page
  const emergencyLogout = () => {
    if (DEBUG) console.log('Emergency logout initiated');
    
    // Try to clear localStorage and any session cookies
    try {
      localStorage.clear();
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    } catch (e) {
      if (DEBUG) console.error('Failed to clear local storage or cookies:', e);
    }
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  // While checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          {/* Robot builder animation */}
          <div className="robot-builder-container mb-8">
            {/* Account frame being built */}
            <div className="account-frame"></div>
            
            {/* Gears */}
            <div className="gear gear-1"></div>
            <div className="gear gear-2"></div>
            
            {/* Robots */}
            <div className="robot-left"></div>
            <div className="robot-right"></div>
            
            {/* Sparks */}
            <div className="spark spark-1"></div>
            <div className="spark spark-2"></div>
            <div className="spark spark-3"></div>
          </div>
          
          {/* Loading text */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Building Your Account</h2>
            <p className="text-gray-600 mb-4">Our robots are working on it</p>
            
            <div className="mt-4 flex items-center justify-center">
              <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 
                      pulse-border-animation flex items-center">
                <span>Setting up your dashboard</span>
                <span className="ml-1 inline-flex">
                  <span className="animate-bounce mx-0.5">.</span>
                  <span className="animate-bounce mx-0.5 delay-100">.</span>
                  <span className="animate-bounce mx-0.5 delay-200">.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error but not related to authentication
  if (error || localError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-50 p-8 rounded-md max-w-md">
          <p className="text-2xl font-bold text-red-600 mb-4">Error loading your account</p>
          <p className="text-sm text-red-700 mt-2 mb-6 whitespace-pre-wrap">
            {error || localError || 'Failed to load profile data'}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
            <button 
              onClick={forceRedirectToLogin}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Login
            </button>
            <button 
              onClick={emergencyLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Emergency Logout
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-500 text-center">
            If you continue to see this error, please contact support
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="robot-builder-container mb-8 scale-75">
          <div className="robot-left"></div>
          <div className="robot-right"></div>
          <div className="spark spark-1"></div>
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
        
        <button 
          onClick={forceRedirectToLogin}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go to Login Now
        </button>
      </div>
    );
  }

  // User is authenticated, show dashboard
  return <Dashboard />;
} 