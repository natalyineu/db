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

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await retryProfile();
      await loadCampaigns();
    } catch (error) {
      if (DEBUG) console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600); // Add slight delay for UX
    }
  }, [retryProfile, loadCampaigns]);

  // Load campaigns once profile is available
  useEffect(() => {
    if (profile && !campaigns) {
      loadCampaigns();
    }
  }, [profile, campaigns, loadCampaigns]);

  if (isLoading) {
    return <RobotLoader title="Loading Dashboard" subtitle="Preparing your account data..." />;
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
    <div className={`container mx-auto py-10 px-4 transition-opacity duration-500 ease-out ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      <DashboardHeader
        title="Dashboard"
        userName={profile.first_name || profile.email.split('@')[0]}
        onSignOut={handleSignOut}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile information */}
        <div className={`lg:col-span-1 transition-all duration-500 ease-out ${activeSection >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProfileInfo profile={profile} />
        </div>
        
        {/* Recent campaigns */}
        <div className={`lg:col-span-2 transition-all duration-500 ease-out ${activeSection >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
      
      {/* Additional dashboard content could go here */}
    </div>
  );
} 