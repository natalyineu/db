"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import './loading-animation.css';
import { formatDate, formatProfileField } from '@/utils/profile-utils';
import { RobotLoader, ErrorDisplay } from '@/components/ui';

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
            'Accept': 'application/json',
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
              updated_at: profileData.updated_at,
              status: profileData.status ? String(profileData.status) : undefined
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
        <RobotLoader 
          title="Loading Your Dashboard"
          subtitle="Our robots are retrieving your data"
          message="Verifying your account"
          showRetry={true}
          retryCount={retryCount}
          maxRetries={3}
        />
      </main>
    );
  }

  // Show error state if we have an error or no profile
  if (localError || authError || (!profile && !localProfile && isAuthenticated && !isLoading && !localLoading)) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <ErrorDisplay 
          message={localError || authError || "Unable to load your profile data"}
          subMessage={retryCount >= 3 ? 'Maximum retry attempts reached.' : undefined}
          onRetry={handleRetry}
          onBack={() => router.push('/login')}
          backText="Back to Login"
        />
      </main>
    );
  }

  // Show dashboard if we have profile data (either from auth context or local state)
  const displayProfile = profile || localProfile;
  if (displayProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Business Account Portal
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome to your account management dashboard
            </p>
          </div>

          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition hover:shadow-md">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-24 flex items-end">
                <div className="bg-white p-1 rounded-full mx-6 -mb-10 shadow-md border-4 border-white">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="text-2xl font-bold">
                      {displayProfile.email && displayProfile.email.substring(0, 1).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-12">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{displayProfile.email}</h2>
                <div className="text-sm text-gray-500 mb-4">Account ID: {displayProfile.id && displayProfile.id.substring(0, 8)}...</div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    displayProfile.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : displayProfile.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formatProfileField(displayProfile.status) || 'Active'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Member since {formatDate(displayProfile.created_at, 'MMM YYYY')}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Business</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{displayProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.status) || 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(displayProfile.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(displayProfile.updated_at) || 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(displayProfile.last_login) || 'Now'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Login Count</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.login_count) || '1'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Business Information</h2>
                  <button className="text-xs px-3 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">First Name</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.first_name) || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Name</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.last_name) || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.company) || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Job Title</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.job_title) || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{formatProfileField(displayProfile.phone) || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayProfile.city || displayProfile.country ? 
                        `${formatProfileField(displayProfile.city) || ''} ${formatProfileField(displayProfile.country) || ''}` : 
                        'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                  <button className="text-xs px-3 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Configure
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Enabled
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-gray-900">Browser Notifications</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-gray-900">Edit Profile</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-gray-900">Add Service</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-gray-900">Billing</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-gray-900">Support</span>
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 text-center text-sm text-gray-500">
            <p>© 2023 Personal Account System. All rights reserved.</p>
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