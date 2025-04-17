'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import { CleanBackground } from '@/components/ui';
import { 
  AccountInfoCard, 
  NextStepsCard, 
  AccountHeader,
  BriefSection
} from './components';
import { useBriefForm } from './hooks/useBriefForm';

export default function AccountOverviewPage() {
  const { isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [briefStatus, setBriefStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [paymentStatus, setPaymentStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [campaignStatus, setCampaignStatus] = useState<'offline' | 'in progress' | 'online'>('offline');
  const [brief, setBrief] = useState<any>(null);
  const [userBusinessType, setUserBusinessType] = useState<string>('Business');
  const router = useRouter();
  const supabase = createBrowserClient();
  
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

      try {
        // Check if there are any campaigns to determine brief status
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*, status')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (campaignError) {
          console.error('Error fetching campaigns:', campaignError);
          return;
        }

        // Set business type from profile metadata if available
        if (profile && (profile as any).metadata && (profile as any).metadata.business_type) {
          setUserBusinessType((profile as any).metadata.business_type);
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
        console.error('Error:', error);
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
      await signOut();
      // No need to redirect here as the signOut method will redirect to the home page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Combined loading state
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-3 flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full mx-auto mb-3"></div>
          <div className="h-4 w-40 bg-blue-100 rounded mx-auto mb-2"></div>
          <div className="h-3 w-32 bg-blue-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-3 text-center">
        <h2 className="text-xl font-semibold mb-3">Profile Not Found</h2>
        <p className="mb-3">We couldn&apos;t find your profile information.</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <CleanBackground>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 theme-transition">
        {/* Account Header */}
        <AccountHeader 
          profile={profile}
          userBusinessType={userBusinessType}
          onLogout={handleLogout}
        />
        
        {/* Main Content Area - Single Column Layout */}
        <div className="flex flex-col space-y-5 sm:space-y-6 mt-4 sm:mt-6">
          {/* Brief Section */}
          <BriefSection
            brief={brief}
            isEditing={isEditing}
            formData={{
              platforms: [formData.landingPageUrl || '', formData.creativesLink || ''],
              target_audience: formData.targetAudience || '',
              location: formData.location || '',
              start_date: formData.start_date || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
              end_date: formData.end_date || new Date(new Date().setDate(new Date().getDate() + 31)).toISOString().split('T')[0],
              type: (formData.goal || 'Awareness').toLowerCase(),
              description: formData.additionalNotes || '',
              consent: formData.consent || false,
              business_name: formData.businessName || ''
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
          
          {/* Account Information */}
          <AccountInfoCard 
            profileEmail={profile.email} 
            createdAt={profile.created_at} 
            plan={profile.plan}
          />

          {/* Next Steps */}
          <NextStepsCard 
            briefStatus={briefStatus} 
            paymentStatus={paymentStatus}
            campaignStatus={campaignStatus}
          />
        </div>
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-10 pt-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-3 md:mb-0 text-center md:text-left">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} AI-Vertise. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="/faq" className="text-sm text-gray-500 hover:text-indigo-600">FAQ</a>
              <a href="/privacy-policy" className="text-sm text-gray-500 hover:text-indigo-600">Privacy</a>
              <a href="/terms-of-service" className="text-sm text-gray-500 hover:text-indigo-600">Terms</a>
              <a href="/cookie-policy" className="text-sm text-gray-500 hover:text-indigo-600">Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </CleanBackground>
  );
} 