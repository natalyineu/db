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
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  target: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  goal: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  notes: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    location: '',
    goal: 'Awareness',
    additionalNotes: '',
    consent: false
  });
  const [formErrors, setFormErrors] = useState<{
    landingPageUrl?: string;
    creativesLink?: string;
    location?: string;
    consent?: string;
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

  // New handler for checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));

    // Clear error for this field when user checks
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
      location?: string;
      consent?: string;
    } = {};
    
    // Basic domain validation (non-empty and contains at least one dot)
    if (!formData.landingPageUrl) {
      errors.landingPageUrl = 'Landing page URL is required';
    } else if (!formData.landingPageUrl.includes('.')) {
      errors.landingPageUrl = 'Please enter a valid domain name (e.g., example.com)';
    }
    
    // Optional creative link validation - only if provided
    if (formData.creativesLink && !formData.creativesLink.includes('.') && 
        formData.creativesLink.toLowerCase() !== 'none' && 
        formData.creativesLink.toLowerCase() !== 'no') {
      errors.creativesLink = 'Please enter a valid URL or type "none" or "no"';
    }

    // Location validation - required field
    if (!formData.location) {
      errors.location = 'Location is required';
    }

    // Consent validation
    if (!formData.consent) {
      errors.consent = 'You must agree to our terms and services';
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
      
      // Do the same for creatives link if provided and not 'none' or 'no'
      if (formDataToSubmit.creativesLink && 
          formDataToSubmit.creativesLink.toLowerCase() !== 'none' && 
          formDataToSubmit.creativesLink.toLowerCase() !== 'no' && 
          !formDataToSubmit.creativesLink.match(/^https?:\/\//)) {
        formDataToSubmit.creativesLink = `https://${formDataToSubmit.creativesLink}`;
      }

      // Calculate default start date (1-2 days from now)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 2) + 1); // Random 1-2 days
      
      // Calculate default end date (30 days from start date)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 30);

      if (isEditing && existingBrief?.id) {
        // Update existing campaign
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            type: formDataToSubmit.goal.toLowerCase() as any,
            description: formDataToSubmit.additionalNotes,
            target_audience: formDataToSubmit.targetAudience,
            location: formDataToSubmit.location,
            platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink],
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          })
          .eq('id', existingBrief.id);

        if (updateError) throw updateError;

        // Update local state
        setExistingBrief({
          ...existingBrief,
          type: formDataToSubmit.goal.toLowerCase(),
          description: formDataToSubmit.additionalNotes,
          target_audience: formDataToSubmit.targetAudience,
          location: formDataToSubmit.location,
          platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink],
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
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
            location: formDataToSubmit.location,
            platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink],
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
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
        location: '',
        goal: 'Awareness',
        additionalNotes: '',
        consent: false
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
        location: existingBrief.location || '',
        goal: existingBrief.type ? existingBrief.type.charAt(0).toUpperCase() + existingBrief.type.slice(1) : 'Awareness',
        additionalNotes: existingBrief.description || '',
        consent: true
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
      <div className="container mx-auto p-6 theme-transition">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {profile.first_name?.[0] || profile.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI-Vertise Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm ${userBusinessType === 'Business' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {userBusinessType}
            </div>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Account Information & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-semibold">Account Information</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Member since:</span>
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-semibold">Next Steps</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Account created:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  briefStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  Yes
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Payment:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  paymentStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {paymentStatus === 'Yes' ? 'Completed' : 'Required'}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Brief Sent:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  briefStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {briefStatus === 'Yes' ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Your Brief */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-semibold">Your Brief</h2>
            </div>
            
            {existingBrief && !isEditing && (
              <button 
                onClick={handleEditBrief}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 flex items-center gap-1 text-sm"
              >
                {icons.edit}
                <span>Edit Brief</span>
              </button>
            )}
          </div>
          
          {existingBrief && !isEditing ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Landing Page URL:</h3>
                <p className="mt-1 break-all">
                  <a 
                    href={existingBrief.platforms?.[0]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {existingBrief.platforms?.[0]}
                  </a>
                </p>
              </div>
              
              {existingBrief.platforms?.[1] && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Creatives Link:</h3>
                  <p className="mt-1 break-all">
                    <a 
                      href={existingBrief.platforms?.[1]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {existingBrief.platforms?.[1]}
                    </a>
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Target Audience:</h3>
                <p className="mt-1">{existingBrief.target_audience || "Not specified"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location:</h3>
                <p className="mt-1">{existingBrief.location || "Not specified"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Campaign Period:</h3>
                <p className="mt-1">
                  {existingBrief.start_date ? new Date(existingBrief.start_date).toLocaleDateString() : "Not specified"} - {existingBrief.end_date ? new Date(existingBrief.end_date).toLocaleDateString() : "Not specified"} 
                  (30 days)
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Goal:</h3>
                <p className="mt-1 capitalize">{existingBrief.type || "Awareness"}</p>
              </div>
              
              {existingBrief.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Additional Notes:</h3>
                  <p className="mt-1">{existingBrief.description}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Landing Page URL<span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icons.url}
                  </div>
                  <input
                    type="text"
                    name="landingPageUrl"
                    value={formData.landingPageUrl}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      formErrors.landingPageUrl ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md`}
                    placeholder="www.example.com"
                  />
                </div>
                {formErrors.landingPageUrl && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.landingPageUrl}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Creatives Link
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icons.url}
                  </div>
                  <input
                    type="text"
                    name="creativesLink"
                    value={formData.creativesLink}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      formErrors.creativesLink ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md`}
                    placeholder="drive.google.com/..."
                  />
                </div>
                {formErrors.creativesLink && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.creativesLink}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Optional: Links to campaign assets or creatives, or type "no" for AI-generated ones</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Audience
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icons.target}
                  </div>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Women 25-34 interested in fitness"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 sm:text-sm border ${
                      formErrors.location ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-md`}
                    placeholder="e.g., United States, New York"
                  />
                </div>
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icons.goal}
                  </div>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Awareness">Awareness</option>
                    <option value="Consideration">Consideration</option>
                    <option value="Conversions">Conversions</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    {icons.notes}
                  </div>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Any specific requirements or additional information... (Default campaign start: 1-2 days from now, duration: 30 days)"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">By default, your campaign will start in 1-2 days and run for 30 days. If you need specific dates, please mention them here.</p>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={handleCheckboxChange}
                    className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
                      formErrors.consent ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="consent" className="font-medium text-gray-700">
                    I agree to AI-Vertise's <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
                  </label>
                  {formErrors.consent && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.consent}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isEditing ? 'Save Changes' : 'Submit Brief'}
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* KPI Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <h2 className="text-lg font-semibold">Campaign Performance</h2>
            </div>
            
            <Link
              href="/data/kpi"
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm"
            >
              View Full Dashboard
            </Link>
          </div>
          
          <div className="text-center p-10 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-gray-500 font-medium mb-2">No campaign data yet</h3>
            <p className="text-gray-400 mb-4">Performance metrics will appear here once your campaign is live</p>
            <Link 
              href="/data/kpi"
              className="px-4 py-2 inline-flex bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Set Up KPI Tracking
            </Link>
          </div>
        </div>
      </div>
    </CleanBackground>
  );
} 