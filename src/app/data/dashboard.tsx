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
  const [animateIn, setAnimateIn] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const router = useRouter();

  // Animation sequence effect
  useEffect(() => {
    if (!isLoading && !localLoading) {
      // Start entrance animations after loading completes
      setTimeout(() => {
        setAnimateIn(true);
      }, 300);
      
      // Sequence animations for different sections
      const sectionTimers = [500, 800, 1100, 1400].map((delay, index) => {
        return setTimeout(() => {
          setActiveSection(index + 1);
        }, delay);
      });
      
      return () => {
        sectionTimers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isLoading, localLoading]);

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
      setAnimateIn(false); // Start exit animation
      setLocalLoading(true);
      
      // Delay actual signout to allow animation to complete
      setTimeout(async () => {
        await signOut();
        router.push('/');
      }, 400);
    } catch (error) {
      if (DEBUG) console.error('Error signing out:', error);
      setLocalLoading(false);
      setAnimateIn(true); // Restore animations if error
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
      <main className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-hidden transition-opacity duration-500 ease-in-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className={`mb-10 text-center transform transition-all duration-700 ease-out ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block relative">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 relative z-10">
                Business Account Portal
              </h1>
              {/* Animated highlight effect */}
              <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-500 z-0 rounded-full animate-expand-width"></div>
            </div>
            <p className="mt-3 text-gray-600 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              Welcome to your account management dashboard
            </p>
          </div>

          {/* Dashboard Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className={`col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-700 ease-out hover:shadow-md ${activeSection >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ animationDelay: '200ms' }}>
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-24 flex items-end relative overflow-hidden">
                {/* Animated background patterns */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white animate-float" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-0 left-10 w-16 h-16 rounded-full bg-white animate-float" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="bg-white p-1 rounded-full mx-6 -mb-10 shadow-md border-4 border-white animate-bounce-in">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 relative overflow-hidden">
                    <span className="text-2xl font-bold z-10">
                      {displayProfile.email && displayProfile.email.substring(0, 1).toUpperCase()}
                    </span>
                    {/* Subtle pulse animation behind initials */}
                    <div className="absolute inset-0 bg-indigo-200 opacity-50 animate-pulse-slow"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-12">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{displayProfile.email}</h2>
                <div className="text-sm text-gray-500 mb-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
                  Account ID: {displayProfile.id && displayProfile.id.substring(0, 8)}...
                </div>
                
                <div className="flex items-center space-x-2 mb-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    displayProfile.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : displayProfile.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        displayProfile.status === 'active' ? 'bg-green-400' : displayProfile.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        displayProfile.status === 'active' ? 'bg-green-500' : displayProfile.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></span>
                    </span>
                    {formatProfileField(displayProfile.status) || 'Active'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Member since {formatDate(displayProfile.created_at, 'MMM YYYY')}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative">
                    Sign Out
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white/30 rounded"></span>
                  </span>
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform transition-all duration-700 ease-out hover:shadow-md ${activeSection >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2 animate-fade-in">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Account Information</h2>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center animate-pulse-soft">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Business
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: 'Email', value: displayProfile.email },
                    { label: 'Status', value: formatProfileField(displayProfile.status) || 'Active' },
                    { label: 'Created', value: formatDate(displayProfile.created_at) },
                    { label: 'Last Updated', value: formatDate(displayProfile.updated_at) || 'Never' },
                    { label: 'Last Login', value: formatDate(displayProfile.last_login) || 'Now' },
                    { label: 'Login Count', value: formatProfileField(displayProfile.login_count) || '1' }
                  ].map((item, index) => (
                    <div key={`account-${item.label}`} className="animate-fade-in" style={{ animationDelay: `${300 + index * 100}ms` }}>
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info Card */}
              <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform transition-all duration-700 ease-out hover:shadow-md ${activeSection >= 3 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-2 animate-fade-in">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Business Information</h2>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors transform hover:scale-105 active:scale-95 flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: 'First Name', value: formatProfileField(displayProfile.first_name) || 'Not provided' },
                    { label: 'Last Name', value: formatProfileField(displayProfile.last_name) || 'Not provided' },
                    { label: 'Company', value: formatProfileField(displayProfile.company) || 'Not provided' },
                    { label: 'Job Title', value: formatProfileField(displayProfile.job_title) || 'Not provided' },
                    { label: 'Phone', value: formatProfileField(displayProfile.phone) || 'Not provided' },
                    { label: 'Location', value: displayProfile.city || displayProfile.country ? 
                      `${formatProfileField(displayProfile.city) || ''} ${formatProfileField(displayProfile.country) || ''}` : 
                      'Not provided' }
                  ].map((item, index) => (
                    <div key={`business-${item.label}`} className="animate-fade-in" style={{ animationDelay: `${500 + index * 100}ms` }}>
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences Card */}
              <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transform transition-all duration-700 ease-out hover:shadow-md ${activeSection >= 4 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-2 animate-fade-in">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors transform hover:scale-105 active:scale-95 flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Configure</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { 
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                      name: 'Email Notifications',
                      enabled: true,
                      delay: 700
                    },
                    { 
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
                      name: 'SMS Notifications',
                      enabled: false,
                      delay: 800
                    },
                    { 
                      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
                      name: 'Browser Notifications',
                      enabled: false,
                      delay: 900
                    }
                  ].map((item, index) => (
                    <div key={`notification-${index}`} className="flex items-center justify-between animate-fade-in-right" style={{ animationDelay: `${item.delay}ms` }}>
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 group-hover:bg-indigo-100 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {item.icon}
                          </svg>
                        </span>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in ${item.enabled ? 'cursor-pointer' : 'cursor-pointer'}`}>
                          <input type="checkbox" name={`toggle-${index}`} id={`toggle-${index}`} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked={item.enabled} />
                          <label htmlFor={`toggle-${index}`} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${item.enabled ? 'bg-green-400' : 'bg-gray-300'}`}></label>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {item.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className={`mt-8 transform transition-all duration-700 ease-out ${activeSection >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="relative">
                Quick Actions
                <span className="absolute -right-2 -top-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
                  name: 'Edit Profile',
                  delay: 100
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
                  name: 'Add Service',
                  delay: 200
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
                  name: 'Billing',
                  delay: 300
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                  name: 'Support',
                  delay: 400
                }
              ].map((item, index) => (
                <button key={`action-${index}`} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in" style={{ animationDelay: `${900 + item.delay}ms` }}>
                  <span className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                    {/* Subtle ring effect */}
                    <span className="absolute w-full h-full rounded-full animate-ping-slow bg-indigo-200 opacity-30"></span>
                  </span>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className={`mt-12 text-center text-sm text-gray-500 animate-fade-in`} style={{ animationDelay: '1300ms' }}>
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