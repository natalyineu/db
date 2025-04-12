'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './dashboard';
import { useAuth } from '@/lib/auth/auth-context';
import './loading-animation.css';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// Maximum loading time before showing fallback UI
const MAX_LOADING_TIME = 8000;

export default function DataPage() {
  const { isAuthenticated, isLoading, user, error, refreshProfile } = useAuth();
  const [pageLoadTime] = useState(Date.now());
  const [isRetrying, setIsRetrying] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Force a direct redirect to login using window.location instead of router
  const forceRedirectToLogin = useCallback(() => {
    try {
      router.push('/login');
      // As a guarantee, also set a timer to force redirect with window.location
      setTimeout(() => window.location.href = '/login', 200);
    } catch (error) {
      // If router fails, immediately use direct browser navigation
      window.location.href = '/login';
    }
  }, [router]);

  // Combined loading and auth effects
  useEffect(() => {
    // Debug logging
    if (DEBUG) {
      console.log('DataPage state:', { 
        isLoading, 
        isAuthenticated, 
        hasUser: !!user,
        authError: error,
        elapsedTime: Date.now() - pageLoadTime
      });
    }

    let loadingTimerId: NodeJS.Timeout | null = null;
    let fallbackTimerId: NodeJS.Timeout | null = null;
    
    // Handle auth redirect
    if (!isLoading && !isAuthenticated) {
      if (DEBUG) console.log('No authenticated user found, redirecting to login');
      forceRedirectToLogin();
      return;
    }
    
    // Handle loading timer
    if (isLoading) {
      // Start loading timer
      loadingTimerId = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Update loading phase based on elapsed time
          if (newTime === 3) setLoadingPhase(1);
          if (newTime === 6) setLoadingPhase(2);
          if (newTime === 10) setLoadingPhase(3);
          
          return newTime;
        });
      }, 1000);
      
      // Set fallback timeout
      fallbackTimerId = setTimeout(() => {
        if (isLoading && user) {
          if (DEBUG) console.log('Loading timeout exceeded, attempting API fallback');
          
          // Try direct API approach
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
            if (data && data.profile) {
              setLocalError(null);
            } else {
              setLocalError('Profile could not be loaded');
            }
          })
          .catch(err => {
            if (DEBUG) console.error('API fetch error:', err);
            setLocalError(err.message || 'Error loading profile');
          });
        } else if (isLoading) {
          forceRedirectToLogin();
        }
      }, MAX_LOADING_TIME);
      
      timerRef.current = loadingTimerId;
      fallbackTimeoutRef.current = fallbackTimerId;
    } else {
      // Clear timers when loading is done
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (loadingTimerId) clearInterval(loadingTimerId);
      if (fallbackTimerId) clearTimeout(fallbackTimerId);
    };
  }, [isLoading, isAuthenticated, user, forceRedirectToLogin, error, pageLoadTime]);

  // Handle profile retry with optimized error handling
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setLocalError(null);
    
    try {
      if (user) {
        // Direct fetch through API with retry
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
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
              setIsRetrying(false);
              return;
            } else {
              throw new Error('Profile could not be loaded');
            }
          } catch (e) {
            if (attempt < 1) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw e;
            }
          }
        }
      } else {
        // Try to refresh profile through auth context
        await refreshProfile();
      }
      
      // Wait a moment for state to update
      setTimeout(() => setIsRetrying(false), 500);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Failed to load profile');
      setIsRetrying(false);
    }
  }, [user, refreshProfile]);

  // Emergency logout function with improved error handling
  const emergencyLogout = useCallback(() => {
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
  }, []);

  // Memoize loading status message
  const loadingStatusMessage = useMemo(() => {
    switch (loadingPhase) {
      case 0: return "Connecting to servers";
      case 1: return "Fetching your profile";
      case 2: return "Setting up your dashboard";
      case 3: return "Almost ready";
      default: return "Loading";
    }
  }, [loadingPhase]);

  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          {/* Robot builder animation with phase-based animation classes */}
          <div className={`robot-builder-container mb-8 ${loadingPhase >= 2 ? 'animate-pulse-slow' : ''}`}>
            {/* Account frame being built */}
            <div className="account-frame animate-fade-in"></div>
            
            {/* Gears */}
            <div className={`gear gear-1 ${loadingPhase >= 1 ? 'animate-ping-slow' : ''}`}></div>
            <div className={`gear gear-2 ${loadingPhase >= 1 ? 'animate-ping-slow' : ''}`}></div>
            
            {/* Robots */}
            <div className="robot-left animate-fade-in-up"></div>
            <div className="robot-right animate-fade-in-up"></div>
            
            {/* Sparks */}
            <div className={`spark spark-1 ${loadingPhase >= 2 ? 'animate-bounce-in' : ''}`}></div>
            <div className={`spark spark-2 ${loadingPhase >= 2 ? 'animate-bounce-in delay-100' : ''}`}></div>
            <div className={`spark spark-3 ${loadingPhase >= 2 ? 'animate-bounce-in delay-200' : ''}`}></div>
          </div>
          
          {/* Loading text with timer */}
          <div className="text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">Building Your Account</h2>
            <p className="text-gray-600 mb-4">Our robots are working on it</p>
            
            <div className="mt-4 flex flex-col items-center justify-center">
              {/* Loading Status Message */}
              <div className={`px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 
                      pulse-border-animation flex items-center animate-phase-transition`}
                   key={loadingPhase} /* Key will force re-render and animation restart on phase change */
              >
                <span>{loadingStatusMessage}</span>
                <span className="ml-1 inline-flex">
                  <span className="animate-bounce mx-0.5">.</span>
                  <span className="animate-bounce mx-0.5 delay-100">.</span>
                  <span className="animate-bounce mx-0.5 delay-200">.</span>
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full mt-6 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full shimmer-effect"
                  style={{ 
                    width: `${Math.min(100, (elapsedTime / 15) * 100)}%`, 
                    transition: 'width 1s linear'
                  }}
                ></div>
              </div>
              
              {/* Timer display */}
              <div className="mt-4 text-sm text-gray-500">
                Time elapsed: {elapsedTime}s
              </div>
              
              {/* Show additional message if loading takes too long */}
              {elapsedTime > 5 && (
                <div className="mt-4 text-xs text-gray-600 animate-fade-in max-w-xs text-center">
                  This is taking longer than usual. We&apos;re still trying to connect to your profile.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error UI if there's an error
  if (error || localError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="bg-red-50 p-8 rounded-md max-w-md animate-fade-in">
          <p className="text-2xl font-bold text-red-600 mb-4">Error loading your account</p>
          <p className="text-sm text-red-700 mt-2 mb-6 whitespace-pre-wrap">
            {error || localError || 'Failed to load profile data'}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
            <button 
              onClick={forceRedirectToLogin}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all"
            >
              Back to Login
            </button>
            <button 
              onClick={emergencyLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
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

  // If authenticated and not loading, show dashboard
  return <Dashboard />;
} 