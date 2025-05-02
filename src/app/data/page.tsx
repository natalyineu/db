'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import { CleanBackground } from '@/components/ui';
import { 
  AccountInfoCard, 
  NextStepsCard, 
  AccountHeader,
  BriefSection
} from './components';
import { useBriefForm } from './hooks/useBriefForm';

// Define interface for profile plan
interface PlanData {
  name: string;
  impressions_limit: number;
  payment_status: string;
  renewal_date: string;
}

// Extended profile type
interface ProfileWithPlan {
  id: string;
  email: string;
  created_at: string;
  first_name?: string;
  metadata?: Record<string, any>;
  plan?: string;
  [key: string]: any;
}

export default function AccountOverviewPage() {
  const { isLoading: authLoading, isAuthenticated, signOut, refreshProfile } = useAuth();
  const { profile: rawProfile, isLoading: profileLoading, fetchProfile } = useProfile();
  const profile = rawProfile as ProfileWithPlan;
  // This uses the singleton pattern so it won't create duplicate clients
  const supabase = createBrowserClient();
  
  // Load profile only if needed, not on every mount
  useEffect(() => {
    if (isAuthenticated && !rawProfile && !profileLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, rawProfile, profileLoading, fetchProfile]);
  
  const [briefStatus, setBriefStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [paymentStatus, setPaymentStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [campaignStatus, setCampaignStatus] = useState<'offline' | 'in progress' | 'online'>('offline');
  const [brief, setBrief] = useState<any>(null);
  const [userBusinessType, setUserBusinessType] = useState<string>('Business');
  const [isBriefLoading, setIsBriefLoading] = useState<boolean>(false);
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load status data and existing brief from Supabase
  useEffect(() => {
    async function loadStatusData() {
      if (!profile?.id) return;

      setIsBriefLoading(true);
      
      try {
        // Check if there are any campaigns to determine brief status
        const { data: campaignData, error: campaignError } = await supabase
          .from('briefs')
          .select('id, status, user_id, name, target_audience, location, description, platforms, start_date, end_date')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (campaignError) {
          console.error('Error fetching briefs:', campaignError);
          return;
        }

        // Set business type from profile metadata if available
        if (profile?.metadata?.business_type) {
          setUserBusinessType(profile.metadata.business_type);
        }

        // Use the existence of campaigns as an indicator for brief status
        const hasBrief = campaignData && campaignData.length > 0;
        setBriefStatus(hasBrief ? 'Yes' : 'No');
        
        // If there's an existing brief, store it
        if (hasBrief) {
          setBrief(campaignData[0]);
          
          // Set campaign status if available
          if (campaignData[0].status) {
            setCampaignStatus(campaignData[0].status);
          }
        }
        
        // For payment status, we can use a convention like storing it in metadata
        // This is a placeholder - in a real app you'd have a payment system
        setPaymentStatus('No');
      } catch (error) {
        console.error('Error fetching campaign data:', error);
      } finally {
        setIsBriefLoading(false);
      }
    }

    if (profile) {
      loadStatusData();
    }
  }, [profile, supabase]);

  // Initialize the form handling hook
  const {
    formData,
    formErrors,
    isSubmitting,
    isEditing,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    handleEditBrief,
    handleDeleteBrief
  } = useBriefForm(
    profile,
    userBusinessType,
    brief,
    (newBrief) => setBrief(newBrief),
    (status) => setBriefStatus(status)
  );

  const handleLogout = async () => {
    try {
      console.log('Signing out...');
      await signOut();
      // The signOut method handles redirection to the login page
    } catch (error) {
      console.error('Logout error:', error);
      // If sign out fails, redirect to login page anyway
      router.push('/login');
    }
  };

  // Combined loading state
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="animate-pulse text-center">
          <div className="h-14 w-14 bg-indigo-100 rounded-full mx-auto mb-4"></div>
          <div className="h-5 w-48 bg-indigo-100 rounded-md mx-auto mb-3"></div>
          <div className="h-4 w-36 bg-indigo-50 rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Not Found</h2>
          <p className="mb-6 text-gray-600">We couldn&apos;t find your profile information.</p>
        <button
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Account Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {profile.first_name?.[0] || profile.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800 font-medium">
              {userBusinessType}
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Overview Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <div className="z-10 relative">
              <div className="text-sm font-medium text-gray-500 mb-1">Campaign Status</div>
              <div className="text-xl font-semibold text-gray-800 capitalize flex items-center gap-2">
                {campaignStatus}
                <span className={`inline-block h-2 w-2 rounded-full ${
                  campaignStatus === 'online' ? 'bg-green-500' : 
                  campaignStatus === 'in progress' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></span>
              </div>
            </div>
            <div className={`absolute inset-0 opacity-5 ${
              campaignStatus === 'online' ? 'bg-green-500' : 
              campaignStatus === 'in progress' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <div className="z-10 relative">
              <div className="text-sm font-medium text-gray-500 mb-1">Subscription</div>
              <div className="text-xl font-semibold text-gray-800">
                {profile.plan || 'Free'}
              </div>
            </div>
            <div className="absolute inset-0 opacity-5 bg-indigo-500"></div>
          </div>
        </div>
        
        {/* Main Content Area - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Brief and Account Info */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Campaign Brief Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 px-1">Campaign Brief</h2>
          <BriefSection
            brief={brief}
            isEditing={isEditing}
            formData={{
              platforms: [formData.landingPageUrl || '', formData.creativesLink || ''],
              target_audience: formData.targetAudience || '',
              location: formData.location || '',
              start_date: formData.start_date || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
              end_date: formData.end_date || new Date(new Date().setDate(new Date().getDate() + 31)).toISOString().split('T')[0],
              description: formData.additionalNotes || '',
              consent: formData.consent || false,
              name: formData.businessName || ''
            }}
            formErrors={Object.fromEntries(
              Object.entries(formErrors).filter(([_, v]) => v !== undefined) as [string, string][]
            )}
            isSubmitting={isSubmitting}
            onEdit={handleEditBrief}
            onDelete={handleDeleteBrief}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            handleSubmit={handleSubmit}
          />
            </div>
            
            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-shadow duration-300 hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Account Information
              </h2>
              <div className="space-y-4">
                <div className="transition-colors duration-200 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                  <div className="text-gray-800">{profile.email}</div>
                </div>
                <div className="transition-colors duration-200 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Member Since</div>
                  <div className="text-gray-800">
                    {new Date(profile.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="transition-colors duration-200 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">Subscription Plan</div>
                  <div className="text-gray-800 flex items-center gap-2">
                    {profile.plan || 'Free'}
                    {profile.plan && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Plans, Next Steps and Resources */}
          <div className="space-y-6 lg:space-y-8">
          {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-shadow duration-300 hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Next Steps
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${briefStatus === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} transition-colors duration-200`}>
                    {briefStatus === 'Yes' ? '✓' : '1'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Create Campaign Brief</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {briefStatus === 'Yes' ? 'Completed' : briefStatus === 'In Progress' ? 'In progress' : 'Set up your marketing requirements'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${paymentStatus === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} transition-colors duration-200`}>
                    {paymentStatus === 'Yes' ? '✓' : '2'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Payment Setup</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {paymentStatus === 'Yes' ? 'Completed' : paymentStatus === 'In Progress' ? 'In progress' : 'Set up your payment method'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-1">
                  <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${campaignStatus === 'online' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} transition-colors duration-200`}>
                    {campaignStatus === 'online' ? '✓' : '3'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Campaign Launch</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {campaignStatus === 'online' ? 'Campaign is live' : campaignStatus === 'in progress' ? 'Campaign is being prepared' : 'Launch your campaign'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resources Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-shadow duration-300 hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                Resources
              </h2>
              <div className="space-y-3">
                <a 
                  href="/faq"
                  className="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-700 group hover:translate-x-1"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 mr-3 group-hover:bg-indigo-200 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">FAQ</div>
                    <div className="text-sm text-gray-500">Get answers to common questions</div>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-700 group hover:translate-x-1"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 mr-3 group-hover:bg-indigo-200 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Guides & Tutorials</div>
                    <div className="text-sm text-gray-500">Learn how to maximize your campaigns</div>
                  </div>
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 text-gray-700 group hover:translate-x-1"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 mr-3 group-hover:bg-indigo-200 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Quick Actions</div>
                    <div className="text-sm text-gray-500">Shortcuts to common tasks</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} AI-Vertise. All rights reserved.</p>
            </div>
            <div className="flex space-x-5">
              <a href="/faq" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200">FAQ</a>
              <a href="/privacy-policy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200">Privacy</a>
              <a href="/terms-of-service" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200">Terms</a>
              <a href="/cookie-policy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 