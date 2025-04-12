"use client";

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import './loading-animation.css';
import { formatDate, formatProfileField } from '@/utils';
import { RobotLoader, ErrorDisplay, CampaignList } from '@/components/ui';
import { CampaignService } from '@/services/campaign-service';
import type { Campaign } from '@/types';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// Memoized Header component
const DashboardHeader = memo(({ title, userName, onSignOut }: { 
  title: string; 
  userName: string;
  onSignOut: () => void;
}) => (
  <div className="mb-10 text-center transform transition-all duration-700 ease-out translate-y-0 opacity-100">
    <div className="inline-block relative">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 relative z-10">
        {title}
      </h1>
      <div className="absolute -bottom-1 left-0 w-full h-3 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full transform scale-110 opacity-70"></div>
    </div>
    <p className="mt-4 text-lg text-gray-600">Welcome to your personal account dashboard, {userName}!</p>
    <button 
      onClick={onSignOut}
      className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
    >
      Sign Out
    </button>
  </div>
));
DashboardHeader.displayName = 'DashboardHeader';

// Memoized Profile Info component
const ProfileInfo = memo(({ profile }: { profile: any }) => {
  const profileInfo = useMemo(() => [
    { label: 'Email', value: profile.email },
    { label: 'Account ID', value: profile.id?.substring(0, 8) + '...' },
    { label: 'Created', value: formatDate(profile.created_at) },
    { label: 'Last Updated', value: profile.updated_at ? formatDate(profile.updated_at) : 'Never' }
  ], [profile]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm transform transition-all duration-500 ease-out translate-y-0 opacity-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profileInfo.map((item, index) => (
          <div key={`profile-${index}`} className="flex flex-col animate-fade-in" style={{ animationDelay: `${400 + index * 100}ms` }}>
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className="text-gray-800 font-medium">{formatProfileField(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
ProfileInfo.displayName = 'ProfileInfo';

export default function Dashboard() {
  const { profile, signOut, isLoading, refreshProfile, error: authError, isAuthenticated, user } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const router = useRouter();

  // Memoized profile for display
  const displayProfile = useMemo(() => profile || localProfile, [profile, localProfile]);

  // Animation sequence effect - memoized timing values
  const sectionTimings = useMemo(() => [500, 800, 1100, 1400], []);
  
  useEffect(() => {
    if (!isLoading && !localLoading) {
      // Start entrance animations after loading completes
      const animationTimer = setTimeout(() => {
        setAnimateIn(true);
      }, 300);
      
      // Sequence animations for different sections
      const sectionTimers = sectionTimings.map((delay, index) => {
        return setTimeout(() => {
          setActiveSection(index + 1);
          if (DEBUG) console.log(`Setting active section to ${index + 1}`);
        }, delay);
      });
      
      // Force all sections to be visible after some time, as a fallback
      const fallbackTimer = setTimeout(() => {
        if (activeSection < sectionTimings.length) {
          if (DEBUG) console.log(`Forcing all sections visible`);
          setActiveSection(sectionTimings.length);
        }
      }, 3000);
      
      return () => {
        clearTimeout(animationTimer);
        sectionTimers.forEach(timer => clearTimeout(timer));
        clearTimeout(fallbackTimer);
      };
    }
  }, [isLoading, localLoading, sectionTimings, activeSection]);

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

  // Direct profile fetch with useCallback
  const fetchProfileDirectly = useCallback(async (userId: string) => {
    if (!userId) return;
    
    try {
      if (DEBUG) console.log('Making direct database call to profiles table');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Prefer': 'return=representation'
        }
      });
      
      if (!response.ok) throw new Error(`Profile fetch failed: ${response.statusText}`);
      
      const data = await response.json();
      if (DEBUG) console.log('Direct profile fetch result:', data);
      
      if (data && data.length > 0) {
        const profileData = data[0];
        // Create local profile state since the auth context is having issues
        const userProfile = {
          id: profileData.id,
          email: profileData.email || user?.email || 'user@example.com',
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at,
          status: profileData.status ? String(profileData.status) : undefined
        };
        
        // Set as local component state since we can't update auth context
        setLocalProfile(userProfile);
        setLocalError(null);
        setLocalLoading(false);
        
        if (DEBUG) console.log('Created local profile state:', userProfile);
        return userProfile;
      }
      return null;
    } catch (error) {
      if (DEBUG) console.error('Direct profile fetch error:', error);
      setLocalError(`Profile fetch error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }, [user]);

  // If authenticated but profile is missing, retry a few times
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (!isLoading && isAuthenticated && !profile && retryCount < 3) {
      if (DEBUG) console.log(`No profile found, will retry (${retryCount + 1}/3)`);
      timer = setTimeout(() => {
        if (DEBUG) console.log(`Retrying profile fetch (attempt ${retryCount + 1}/3)`);
        refreshProfile();
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff
    }
    
    // If we've retried 3 times and still no profile, show error
    if (!isLoading && isAuthenticated && !profile && retryCount >= 3) {
      if (DEBUG) console.log('Maximum retry attempts reached, showing error');
      setLocalError('Unable to load your profile after multiple attempts. Please try again later.');
      
      // Direct profile fetch attempt
      if (user) {
        fetchProfileDirectly(user.id);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated, profile, user, refreshProfile, retryCount, fetchProfileDirectly]);

  const handleSignOut = useCallback(async () => {
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
  }, [signOut, router]);

  const handleRetry = useCallback(() => {
    setLocalLoading(true);
    setLocalError(null);
    setRetryCount(0);
    refreshProfile();
    setTimeout(() => setLocalLoading(false), 500);
  }, [refreshProfile]);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async (userId: string) => {
    if (!userId) return;
    
    try {
      setCampaignsLoading(true);
      const campaigns = await CampaignService.getCampaignsByUserId(userId);
      setCampaigns(campaigns);
    } catch (error) {
      if (DEBUG) console.error('Failed to fetch campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  // Fetch campaigns when user is available
  useEffect(() => {
    if (user?.id) {
      fetchCampaigns(user.id);
    }
  }, [user, fetchCampaigns]);

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
  if (displayProfile) {
    return (
      <main className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-hidden transition-opacity duration-500 ease-in-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <DashboardHeader 
            title="Your Dashboard" 
            userName={displayProfile.email.split('@')[0] || 'User'}
            onSignOut={handleSignOut}
          />
          
          {/* Profile Section */}
          <section className={`mb-8 transform transition-all duration-700 delay-100 ease-out ${activeSection >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <ProfileInfo profile={displayProfile} />
          </section>
          
          {/* Campaigns Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Campaigns</h2>
            <CampaignList campaigns={campaigns} isLoading={campaignsLoading} />
          </section>
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