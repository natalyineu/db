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
  CampaignPerformanceCard,
  AccountHeader,
  BriefSection
} from './components';
import { useBriefForm } from './hooks/useBriefForm';

export default function AccountOverviewPage() {
  const { isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [briefStatus, setBriefStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [paymentStatus, setPaymentStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [brief, setBrief] = useState<any>(null);
  const [impressionsUsed, setImpressionsUsed] = useState(0);
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
          .select('*')
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
        }
        
        // Get KPI data to determine impressions used
        const { data: kpiData, error: kpiError } = await supabase
          .from('kpi')
          .select('impressions_fact')
          .eq('user_id', profile.id)
          .order('date', { ascending: false })
          .limit(1);
          
        if (!kpiError && kpiData && kpiData.length > 0) {
          setImpressionsUsed(kpiData[0].impressions_fact || 0);
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
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-24 w-24 bg-blue-100 rounded-full mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-blue-100 rounded mx-auto mb-2"></div>
          <div className="h-4 w-36 bg-blue-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
        <p className="mb-4">We couldn&apos;t find your profile information.</p>
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
      <div className="container mx-auto p-6 theme-transition">
        {/* Account Header */}
        <AccountHeader 
          profile={profile}
          userBusinessType={userBusinessType}
          onLogout={handleLogout}
        />
        
        {/* Account Information & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Account Information */}
          <AccountInfoCard 
            profileEmail={profile.email} 
            createdAt={profile.created_at} 
            plan={profile.plan}
            impressionsUsed={impressionsUsed}
          />

          {/* Next Steps */}
          <NextStepsCard 
            briefStatus={briefStatus} 
            paymentStatus={paymentStatus} 
          />
        </div>
        
        {/* Brief Section */}
        <BriefSection
          brief={brief}
          isEditing={isEditing}
          formData={{
            platforms: [formData.landingPageUrl || '', formData.creativesLink || ''],
            target_audience: formData.targetAudience || '',
            location: formData.location || '',
            start_date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
            end_date: new Date(new Date().setDate(new Date().getDate() + 31)).toISOString().split('T')[0],
            type: (formData.goal || 'Awareness').toLowerCase(),
            description: formData.additionalNotes || '',
            consent: formData.consent || false
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
        
        {/* KPI Section */}
        <CampaignPerformanceCard />
      </div>
    </CleanBackground>
  );
} 