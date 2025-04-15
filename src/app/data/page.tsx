'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';

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
  const router = useRouter();
  const supabase = createBrowserClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load status data from Supabase - modified to use profiles and campaigns
  useEffect(() => {
    async function loadStatusData() {
      if (!profile?.id) return;

      try {
        // Check if there are any campaigns to determine brief status
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', profile.id)
          .limit(1);

        if (campaignError) {
          console.error('Error fetching campaigns:', campaignError);
          return;
        }

        // Use the existence of campaigns as an indicator for brief status
        const hasBrief = campaignData && campaignData.length > 0;
        setBriefStatus(hasBrief ? 'Yes' : 'No');
        
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
    
    // Optional creative link validation
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

      // Instead of using user_briefs, create a campaign with the brief info
      const { error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: profile.id,
          name: 'New Campaign',
          status: 'draft',
          type: formDataToSubmit.goal.toLowerCase() as any, // Convert goal to campaign type
          budget: 0,
          description: formDataToSubmit.additionalNotes,
          target_audience: formDataToSubmit.targetAudience,
          // Store landing page and creatives as platforms array or in description
          platforms: [formDataToSubmit.landingPageUrl, formDataToSubmit.creativesLink]
        });

      if (campaignError) throw campaignError;

      // Update local state to reflect that the user has submitted a brief
      setBriefStatus('Yes');
      
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {profile.first_name?.[0] || profile.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI-Vertise Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <span className="w-2 h-2 mr-1 rounded-full bg-purple-600"></span>
            Coffee Shop
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 rounded-full bg-green-600"></span>
            Active
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account created:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Yes
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                paymentStatus === 'Yes' 
                  ? 'bg-green-100 text-green-800' 
                  : paymentStatus === 'In Progress' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {paymentStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Brief Sent:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                briefStatus === 'Yes' 
                  ? 'bg-green-100 text-green-800' 
                  : briefStatus === 'In Progress' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {briefStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {briefStatus !== 'Yes' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit Your Brief</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landing Page URL *
                </label>
                <input
                  type="text"
                  name="landingPageUrl"
                  value={formData.landingPageUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. google.com"
                  className={`w-full px-3 py-2 border ${
                    formErrors.landingPageUrl ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.landingPageUrl ? (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.landingPageUrl}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Just enter the domain name - we'll add https:// for you
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creatives (Google Drive Link)
                </label>
                <input
                  type="text"
                  name="creativesLink"
                  value={formData.creativesLink}
                  onChange={handleInputChange}
                  placeholder="e.g. drive.google.com/your-folder"
                  className={`w-full px-3 py-2 border ${
                    formErrors.creativesLink ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {formErrors.creativesLink && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.creativesLink}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience, Location, Persona
                </label>
                <textarea
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Describe your target audience"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Awareness">Awareness</option>
                  <option value="Consideration">Consideration</option>
                  <option value="Conversions">Conversions</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Brief
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Campaign Analytics</h2>
          <Link 
            href="/data/kpi" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View KPI Dashboard
          </Link>
        </div>
        <p className="text-gray-600">
          Track your campaign performance with our comprehensive KPI dashboard. 
          Monitor impressions, clicks, and reach to optimize your marketing efforts.
        </p>
      </div>
    </div>
  );
} 