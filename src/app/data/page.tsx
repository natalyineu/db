'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import { CleanBackground } from '@/components/ui';

// Icons for the form
const icons = {
  url: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  target: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  goal: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  notes: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  edit: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
};

export default function AccountOverviewPage() {
  const { isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [briefStatus, setBriefStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [paymentStatus, setPaymentStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [formData, setFormData] = useState({
    landingPageUrl: '',
    creativesLink: '',
    targetAudience: '',
    goal: 'Awareness',
    additionalNotes: ''
  });
  const [formErrors, setFormErrors] = useState<{
    landingPageUrl?: string;
    creativesLink?: string;
  }>({});
  const [userBusinessType, setUserBusinessType] = useState<string>('Business');
  const [existingBrief, setExistingBrief] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();
  
  // Mock data for campaigns - in a real app, you would fetch this from your backend
  const campaigns = [
    { id: 1, name: 'Summer Promotion', status: 'active', platform: 'Facebook', budget: 500 },
    { id: 2, name: 'Product Launch', status: 'draft', platform: 'Instagram', budget: 750 },
    { id: 3, name: 'Holiday Special', status: 'paused', platform: 'Google', budget: 1000 }
  ];

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
          setExistingBrief(campaignData[0]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!profile?.id) return;

    // Basic domain validation
    const errors: {
      landingPageUrl?: string;
      creativesLink?: string;
    } = {};
    
    // Basic domain validation (non-empty and contains at least one dot)
    if (!formData.landingPageUrl) {
      errors.landingPageUrl = 'Landing page URL is required';
    } else if (!formData.landingPageUrl.includes('.')) {
      errors.landingPageUrl = 'Please enter a valid domain name (e.g., example.com)';
    }
    
    // Optional creative link validation - only if provided
    if (formData.creativesLink && !formData.creativesLink.includes('.')) {
      errors.creativesLink = 'Please enter a valid URL';
    }
    
    // If there are any errors, don't submit the form
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});

    try {
      // Prepare form data - ensure URL has protocol
      const formDataToSubmit = {
        ...formData
      };
      
      // Add https:// protocol if missing
      if (formDataToSubmit.landingPageUrl && !formDataToSubmit.landingPageUrl.match(/^https?:\/\//)) {
        formDataToSubmit.landingPageUrl = `https://${formDataToSubmit.landingPageUrl}`;
      }
      
      // Do the same for creatives link if provided
      if (formDataToSubmit.creativesLink && !formDataToSubmit.creativesLink.match(/^https?:\/\//)) {
        formDataToSubmit.creativesLink = `https://${formDataToSubmit.creativesLink}`;
      }

      if (isEditing && existingBrief?.id) {
        // Update existing campaign
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            type: formDataToSubmit.goal.toLowerCase() as any,
            description: formDataToSubmit.additionalNotes,
            target_audience: formDataToSubmit.targetAudience,
            platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink]
          })
          .eq('id', existingBrief.id);

        if (updateError) throw updateError;

        // Update local state
        setExistingBrief({
          ...existingBrief,
          type: formDataToSubmit.goal.toLowerCase(),
          description: formDataToSubmit.additionalNotes,
          target_audience: formDataToSubmit.targetAudience,
          platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink]
        });

        setIsEditing(false);
      } else {
        // Create new campaign
        const { data: newCampaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            user_id: profile.id,
            name: 'New Campaign',
            status: 'draft',
            type: formDataToSubmit.goal.toLowerCase() as any,
            budget: 0,
            description: formDataToSubmit.additionalNotes,
            target_audience: formDataToSubmit.targetAudience,
            platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink]
          })
          .select();

        if (campaignError) throw campaignError;

        // Set the new brief as the existing brief
        if (newCampaign && newCampaign.length > 0) {
          setExistingBrief(newCampaign[0]);
        }

        // Update brief status
        setBriefStatus('Yes');
      }
      
      // Reset form
      setFormData({
        landingPageUrl: '',
        creativesLink: '',
        targetAudience: '',
        goal: 'Awareness',
        additionalNotes: ''
      });
      
    } catch (error) {
      console.error('Error submitting brief:', error);
    }
  };

  const handleEditBrief = () => {
    // Load existing brief data into the form
    if (existingBrief) {
      // Extract the URLs from platforms array
      const landingPageUrl = existingBrief.platforms?.[0] || '';
      const creativesLink = existingBrief.platforms?.[1] || '';
      
      setFormData({
        landingPageUrl,
        creativesLink,
        targetAudience: existingBrief.target_audience || '',
        goal: existingBrief.type ? existingBrief.type.charAt(0).toUpperCase() + existingBrief.type.slice(1) : 'Awareness',
        additionalNotes: existingBrief.description || ''
      });
      
      setIsEditing(true);
    }
  };

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
        <p className="mb-4">We couldn't find your profile information.</p>
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
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          {/* Welcome user card */}
          <div className="col-span-1 md:col-span-8">
            <div className="bg-white rounded-lg p-4">
              <h1 className="text-2xl font-semibold mb-4">
                Welcome back, {profile?.first_name || 'User'}! 
              </h1>
              <p className="text-base text-gray-500 mb-4">
                Here's what's happening with your campaigns today:
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => router.push('/campaigns/new')}
              >
                Create New Campaign
              </button>
            </div>
          </div>
          
          {/* Account overview card */}
          <div className="col-span-1 md:col-span-4">
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">
                Account Status
              </h2>
              <div className="mb-4">
                <p className="text-base text-gray-500">
                  Plan: {((profile as any)?.subscription_tier) || 'Free'}
                </p>
                <p className="text-base text-gray-500">
                  Next billing: {((profile as any)?.next_billing_date) || 'N/A'}
                </p>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => router.push('/settings')}
              >
                Manage Account
              </button>
            </div>
          </div>
          
          {/* Recent campaigns */}
          <div className="col-span-1 md:col-span-8">
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">
                Recent Campaigns
              </h2>
              <div className="mb-4">
                <table className="table-auto w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Campaign</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Platform</th>
                      <th className="px-4 py-2 text-right">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="border px-4 py-2">{campaign.name}</td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            campaign.status === 'active' ? 'bg-green-200 text-green-800' :
                            campaign.status === 'paused' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="border px-4 py-2">{campaign.platform}</td>
                        <td className="border px-4 py-2 text-right">${campaign.budget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => router.push('/campaigns')}
              >
                View All Campaigns
              </button>
            </div>
          </div>
          
          {/* Tips & Resources */}
          <div className="col-span-1 md:col-span-8">
            <div className="bg-white rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">
                Tips & Resources
              </h2>
              <div className="mb-4">
                <p className="text-base text-gray-500">
                  Optimize Your Campaigns
                </p>
                <p className="text-base text-gray-500">
                  Check your analytics regularly to adjust your targeting and improve ROI.
                </p>
              </div>
              <div className="mb-4">
                <p className="text-base text-gray-500">
                  New Features Available
                </p>
                <p className="text-base text-gray-500">
                  We've added new audience targeting options. Try them in your next campaign!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CleanBackground>
  );
} 