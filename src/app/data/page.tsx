'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

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
    <div className="container mx-auto p-6 theme-transition dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {profile.first_name?.[0] || profile.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">AI-Vertise Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            <span className="w-2 h-2 mr-1 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            {userBusinessType}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <span className="w-2 h-2 mr-1 rounded-full bg-green-600 dark:bg-green-400"></span>
            Active
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 theme-transition">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium dark:text-white">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Member since:</span>
              <span className="font-medium dark:text-white">{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 theme-transition">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Next Steps</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Account created:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Yes
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Payment:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                paymentStatus === 'Yes' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : paymentStatus === 'In Progress' 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Brief Sent:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                briefStatus === 'Yes' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : briefStatus === 'In Progress' 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {briefStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Show Edit button if brief exists and not in editing mode */}
      {briefStatus === 'Yes' && !isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 theme-transition">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-white">Your Brief</h2>
            <button
              onClick={handleEditBrief}
              className="inline-flex items-center px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {icons.edit}
              <span className="ml-1">Edit Brief</span>
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Landing Page URL:</span>
              <a 
                href={existingBrief?.platforms?.[0]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
              >
                {existingBrief?.platforms?.[0]}
              </a>
            </div>
            {existingBrief?.platforms?.[1] && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 block mb-1">Creatives Link:</span>
                <a 
                  href={existingBrief?.platforms?.[1]} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                >
                  {existingBrief?.platforms?.[1]}
                </a>
              </div>
            )}
            <div>
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Target Audience:</span>
              <p className="dark:text-white">{existingBrief?.target_audience}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400 block mb-1">Goal:</span>
              <p className="dark:text-white">{existingBrief?.type ? existingBrief.type.charAt(0).toUpperCase() + existingBrief.type.slice(1) : 'N/A'}</p>
            </div>
            {existingBrief?.description && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 block mb-1">Additional Notes:</span>
                <p className="dark:text-white">{existingBrief?.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show form if no brief exists or in editing mode */}
      {(briefStatus !== 'Yes' || isEditing) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 theme-transition">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {isEditing ? 'Edit Your Brief' : 'Submit Your Brief'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {icons.url}
                  <span className="ml-1">Landing Page URL *</span>
                </label>
                <input
                  type="text"
                  name="landingPageUrl"
                  value={formData.landingPageUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. google.com"
                  className={`w-full px-3 py-2 border ${
                    formErrors.landingPageUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.landingPageUrl ? (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.landingPageUrl}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Just enter the domain name - we'll add https:// for you
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {icons.url}
                  <span className="ml-1">Creatives (Google Drive Link)</span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  name="creativesLink"
                  value={formData.creativesLink}
                  onChange={handleInputChange}
                  placeholder="e.g. drive.google.com/your-folder"
                  className={`w-full px-3 py-2 border ${
                    formErrors.creativesLink ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                />
                {formErrors.creativesLink && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.creativesLink}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  We can create creatives for you if you don't have them
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {icons.target}
                  <span className="ml-1">Target Audience, Location, Persona</span>
                </label>
                <textarea
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your target audience"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {icons.goal}
                  <span className="ml-1">Goal</span>
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Awareness">Awareness</option>
                  <option value="Consideration">Consideration</option>
                  <option value="Conversions">Conversions</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {icons.notes}
                  <span className="ml-1">Additional Notes</span>
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      landingPageUrl: '',
                      creativesLink: '',
                      targetAudience: '',
                      goal: 'Awareness',
                      additionalNotes: ''
                    });
                  }}
                  className="px-6 py-2 mr-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isEditing ? 'Update Brief' : 'Submit Brief'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 theme-transition">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Campaign Analytics</h2>
          <Link 
            href="/data/kpi" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View KPI Dashboard
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Track your campaign performance with our comprehensive KPI dashboard. 
          Monitor impressions, clicks, and reach to optimize your marketing efforts.
        </p>
      </div>
    </div>
  );
} 