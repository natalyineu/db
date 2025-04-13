"use client";

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import './loading-animation.css';
import { formatDate, formatProfileField } from '@/utils';
import { RobotLoader, ErrorDisplay, CampaignList, CreateCampaignButton } from '@/components/ui';
import { CampaignService } from '@/services/campaign-service';
import type { Campaign, UserProfile } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import Card from '@/features/shared/ui/Card';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// Memoized Header component
const DashboardHeader = memo(({ title, userName, onSignOut, onRefresh, isRefreshing }: { 
  title: string; 
  userName: string;
  onSignOut: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) => (
  <div className="mb-4 text-center transform transition-all duration-700 ease-out translate-y-0 opacity-100">
    <div className="inline-block relative">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 relative z-10">
        {title}
      </h1>
      <div className="absolute -bottom-1 left-0 w-full h-2 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full transform scale-110 opacity-70"></div>
    </div>
    <p className="mt-2 text-base text-gray-600">Welcome to your personal account dashboard, {userName}!</p>
    <div className="mt-2 flex justify-center space-x-2">
      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`px-3 py-1 ${isRefreshing ? 'bg-blue-50 text-blue-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} rounded-md transition-colors text-sm flex items-center`}
      >
        {isRefreshing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refreshing...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </>
        )}
      </button>
      <button 
        onClick={onSignOut}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
      >
        Sign Out
      </button>
    </div>
  </div>
));
DashboardHeader.displayName = 'DashboardHeader';

// Memoized Profile Info component
const ProfileInfo = memo(({ profile }: { profile: UserProfile }) => {
  const profileInfo = useMemo(() => [
    { label: 'Email', value: profile.email },
    { label: 'Account ID', value: profile.id?.substring(0, 8) + '...' },
    { label: 'Created', value: formatDate(profile.created_at) },
    { label: 'Last Updated', value: profile.updated_at ? formatDate(profile.updated_at) : 'Never' }
  ], [profile]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm transform transition-all duration-500 ease-out translate-y-0 opacity-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  const { signOut, isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, error: profileError, retry: retryProfile } = useProfile(3);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Combined loading state
  const isLoading = authLoading || profileLoading;

  // Animation sequence effect - memoized timing values
  const sectionTimings = useMemo(() => [500, 800], []);
  
  // Define loadCampaigns before useEffect to avoid dependency issues
  const loadCampaigns = useCallback(async () => {
    if (!profile) return;
    
    setCampaignsLoading(true);
    try {
      // Use static method consistently - don't create an unused instance
      const userCampaigns = await CampaignService.getCampaignsByUserId(profile.id);
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!isLoading) {
      // Start entrance animations after loading completes
      const animationTimer = setTimeout(() => {
        setAnimateIn(true);
      }, 300);
      
      // Sequence animations only for profile section
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
      }, 2000);
      
      return () => {
        clearTimeout(animationTimer);
        sectionTimers.forEach(timer => clearTimeout(timer));
        clearTimeout(fallbackTimer);
      };
    }
  }, [isLoading, sectionTimings, activeSection]);

  // Log authentication state changes for debugging
  useEffect(() => {
    // If auth is done loading but no authentication, redirect to login
    if (!authLoading && !isAuthenticated) {
      if (DEBUG) console.log('Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSignOut = useCallback(async () => {
    try {
      setAnimateIn(false); // Start exit animation
      
      // Delay actual signout to allow animation to complete
      setTimeout(async () => {
        await signOut();
        router.push('/');
      }, 400);
    } catch (error) {
      if (DEBUG) console.error('Error signing out:', error);
      setAnimateIn(true); // Restore animations if error
    }
  }, [signOut, router]);

  // Load campaigns when profile is available
  useEffect(() => {
    if (profile && !campaigns) {
      loadCampaigns();
    }
  }, [profile, campaigns, loadCampaigns]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    retryProfile();
    loadCampaigns();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [retryProfile, loadCampaigns]);
  
  // Show loading state
  if (isLoading) {
    return <RobotLoader title="Loading Dashboard" subtitle="Preparing your account" />;
  }
  
  // Show error state
  if (profileError && !profile) {
    return (
      <ErrorDisplay 
        message={profileError}
        subMessage="We couldn't load your profile. Please try again."
        onRetry={retryProfile}
      />
    );
  }
  
  // If we don't have a profile somehow, but no error either
  if (!profile) {
    return <RobotLoader title="Loading Profile" subtitle="Still working on it..." showRetry />;
  }

  return (
    <div className={`container mx-auto px-4 py-8 transition-all duration-500 ease-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <DashboardHeader 
        title="Dashboard" 
        userName={profile.first_name || profile.email || 'User'} 
        onSignOut={handleSignOut}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      {/* Profile Section */}
      {activeSection > 0 && (
        <div className="mt-8 transition-all duration-500 ease-out opacity-100">
          <ProfileInfo profile={profile} />
        </div>
      )}
      
      {/* Campaigns Section - Always show once profile is loaded */}
      <div className={`mt-8 transition-all duration-500 ease-out ${activeSection > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
           style={{ transitionDelay: '200ms' }}>
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Campaigns</h2>
              <CreateCampaignButton userId={profile.id} onCampaignCreated={loadCampaigns} />
            </div>
            
            <CampaignList 
              campaigns={campaigns || []}
              isLoading={campaignsLoading}
              onRefreshNeeded={loadCampaigns}
            />
          </div>
        </Card>
      </div>
    </div>
  );
} 