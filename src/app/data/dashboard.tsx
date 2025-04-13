"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import './loading-animation.css';
import { RobotLoader, ErrorDisplay, CampaignList, CreateCampaignButton } from '@/components/ui';
import { CampaignService } from '@/services/campaign-service';
import type { Campaign } from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { Card, DashboardHeader, ProfileInfo } from '@/features/shared/ui';
import Link from 'next/link';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function Dashboard() {
  const { signOut, isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, error: profileError, retry: retryProfile } = useProfile(3);
  const [animateIn, setAnimateIn] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const CAMPAIGN_LIMIT = 2; // New constant for campaign limit

  // Combined loading state - guaranteed to be true on first render
  const [isLoading, setIsLoading] = useState(true);

  // Animation sequence effect - memoized timing values with consistent, predictable delays
  const sectionTimings = useMemo(() => [200, 350], []);
  
  // Define loadCampaigns before useEffect to avoid dependency issues
  const loadCampaigns = useCallback(async () => {
    if (!profile) return;
    
    setCampaignsLoading(true);
    try {
      // Use static method consistently - don't create an unused instance
      const userCampaigns = await CampaignService.getCampaignsByUserId(profile.id);
      
      // Use requestAnimationFrame to ensure smooth state updates
      requestAnimationFrame(() => {
        setCampaigns(userCampaigns);
        setCampaignsLoading(false);
      });
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaignsLoading(false);
    }
  }, [profile]);

  // Update the loading state based on auth and profile loading
  useEffect(() => {
    // Only set isLoading to false when both auth and profile are done loading
    if (!authLoading && !profileLoading) {
      // Add small delay to ensure transitions are smooth
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, profileLoading]);

  useEffect(() => {
    if (!isLoading) {
      // Start entrance animations after loading completes
      const animationTimer = setTimeout(() => {
        setAnimateIn(true);
      }, 50); // Reduced delay
      
      // Use a single setActiveSection call with a delay to prevent multiple renders
      const sectionTimer = setTimeout(() => {
        setActiveSection(sectionTimings.length);
      }, 350); // Single animation delay
      
      return () => {
        clearTimeout(animationTimer);
        clearTimeout(sectionTimer);
      };
    }
  }, [isLoading, sectionTimings.length]);

  // Log authentication state changes for debugging
  useEffect(() => {
    // If auth is done loading but no authentication, redirect to login
    if (!authLoading && !isAuthenticated) {
      if (DEBUG) console.log('Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load campaigns once profile is available
  useEffect(() => {
    if (profile && !campaigns) {
      loadCampaigns();
    }
  }, [profile, campaigns, loadCampaigns]);

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

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await retryProfile();
      await loadCampaigns();
    } catch (error) {
      if (DEBUG) console.error('Error refreshing data:', error);
    } finally {
      // Use a slightly longer timeout for better UX
      setTimeout(() => setIsRefreshing(false), 700);
    }
  }, [retryProfile, loadCampaigns]);

  if (isLoading) {
    return <RobotLoader title="Building Dashboard" subtitle="Our robots are assembling your dashboard..." />;
  }

  if (profileError) {
    return (
      <div className="container mx-auto py-10 px-4">
        <ErrorDisplay 
          message={profileError}
          subMessage="We couldn't load your profile information. Please try again."
          onRetry={retryProfile}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-10 px-4">
        <ErrorDisplay 
          message="Profile Not Found"
          subMessage="We couldn't find your profile information."
          onBack={() => router.push('/')}
          backText="Back to Home"
        />
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-10 px-4 transition-opacity duration-500 ease-out will-change-opacity ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <DashboardHeader
        title="Dashboard"
        userName={profile.first_name || profile.email.split('@')[0]}
        onSignOut={handleSignOut}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile information */}
        <div className={`lg:col-span-1 transition-all duration-300 ease-out will-change-transform ${activeSection >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProfileInfo profile={profile} />
        </div>
        
        {/* Recent campaigns */}
        <div className={`lg:col-span-2 transition-all duration-300 ease-out will-change-transform ${activeSection >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#3C4043]">Recent Campaigns</h2>
              <CreateCampaignButton
                userId={profile.id}
                onCampaignCreated={loadCampaigns}
              />
            </div>
            
            <CampaignList
              campaigns={campaigns?.slice(0, CAMPAIGN_LIMIT) || []}
              isLoading={campaignsLoading}
              onRefreshNeeded={loadCampaigns}
              showEditButton
            />
            
            {campaigns && campaigns.length > CAMPAIGN_LIMIT && (
              <div className="text-center mt-4">
                <button className="text-sm font-medium text-[#1967D2] hover:text-[#185ABC] transition-colors">
                  View All {campaigns.length} Campaigns
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* KPI Dashboard section */}
      <div className={`transition-all duration-300 ease-out will-change-transform ${activeSection >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <Card className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#3C4043]">Campaign Analytics</h2>
            <Link href="/data/kpi" className="px-4 py-2 bg-[#1967D2] text-white rounded-md hover:bg-[#185ABC] transition-colors">
              KPI Dashboard
            </Link>
          </div>
          <p className="mt-2 text-gray-600">Track and manage your campaign performance metrics and KPIs.</p>
        </Card>
      </div>
    </div>
  );
} 