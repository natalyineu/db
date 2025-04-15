'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase';
import { CleanBackground } from '@/components/ui';
import { 
  AccountInfoCard, 
  NextStepsCard, 
  DeleteConfirmationDialog, 
  BriefDisplay, 
  CampaignPerformanceCard,
  BriefHeader
} from './components';
import BriefForm from './components/BriefForm';

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

// Define the interface for the form data
interface BriefFormData {
  businessName: string;
  targetAudience: string;
  goal: string;
  additionalNotes: string;
  landingPageUrl: string;
  creativesLink: string;
  location: string;
  consent: boolean;
}

// Interface for form errors
interface FormErrors {
  [key: string]: string | undefined;
}

// Add a separate interface for the submission data structure
interface SubmissionData {
  user_id: string;
  submitted_at: string;
  business_type: string;
  business_name: string;
  platforms: string[];
  target_audience: string;
  location: string;
  type: string;
  description: string;
  consent: boolean;
}

export default function AccountOverviewPage() {
  const { isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [briefStatus, setBriefStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [paymentStatus, setPaymentStatus] = useState<'No' | 'In Progress' | 'Yes'>('No');
  const [isEditing, setIsEditing] = useState(false);
  const [hasBrief, setHasBrief] = useState(false);
  const [brief, setBrief] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [kpiStats, setKpiStats] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userBusinessType, setUserBusinessType] = useState<string>('Business');
  const [formData, setFormData] = useState<BriefFormData>({
    businessName: '',
    targetAudience: '',
    landingPageUrl: '',
    creativesLink: '',
    goal: 'Awareness',
    additionalNotes: '',
    location: '',
    consent: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
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
          setBrief(campaignData[0]);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special field naming for the BriefForm component
    if (name.startsWith('platforms[')) {
      const index = parseInt(name.match(/\d+/)?.[0] || '0', 10);
      if (index === 0) {
        setFormData(prev => ({
          ...prev,
          landingPageUrl: value
        }));
      } else if (index === 1) {
        setFormData(prev => ({
          ...prev,
          creativesLink: value
        }));
      }
    } else if (name === 'target_audience') {
      setFormData(prev => ({
        ...prev,
        targetAudience: value
      }));
    } else if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        goal: value.charAt(0).toUpperCase() + value.slice(1) // Capitalize first letter
      }));
    } else if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        additionalNotes: value
      }));
    } else {
      // Handle standard field names
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for the corresponding field
    let errorKey = name;
    if (name === 'target_audience') errorKey = 'targetAudience';
    else if (name === 'type') errorKey = 'goal';
    else if (name === 'description') errorKey = 'additionalNotes';
    else if (name.startsWith('platforms[0]')) errorKey = 'landingPageUrl';
    else if (name.startsWith('platforms[1]')) errorKey = 'creativesLink';

    if (formErrors[errorKey]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form data
    const errors: Record<string, string> = {};
    
    if (!formData.landingPageUrl) {
      errors.landingPageUrl = 'Please enter a landing page URL';
    } else if (
      formData.landingPageUrl !== 'no' && 
      !formData.landingPageUrl.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
    ) {
      errors.landingPageUrl = 'Please enter a valid URL';
    }
    
    if (formData.creativesLink && 
        formData.creativesLink !== 'no' && 
        !formData.creativesLink.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
    ) {
      errors.creativesLink = 'Please enter a valid URL or "no" for AI-generated creatives';
    }
    
    if (!formData.targetAudience) {
      errors.targetAudience = 'Please describe your target audience';
    }
    
    if (!formData.location) {
      errors.location = 'Please specify the campaign location';
    }
    
    if (!formData.goal) {
      errors.goal = 'Please select a campaign goal';
    }
    
    if (!formData.consent) {
      errors.consent = 'You must agree to the terms and conditions';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Format brief data for submission
      if (!profile?.id) return;
      
      // Make sure URLs have proper protocol
      let formattedLandingUrl = formData.landingPageUrl;
      if (formattedLandingUrl && !formattedLandingUrl.match(/^https?:\/\//)) {
        formattedLandingUrl = `https://${formattedLandingUrl}`;
      }
      
      let formattedCreativesLink = formData.creativesLink;
      if (formattedCreativesLink && 
          formattedCreativesLink !== 'no' && 
          !formattedCreativesLink.match(/^https?:\/\//)) {
        formattedCreativesLink = `https://${formattedCreativesLink}`;
      }
      
      // Format the form data to match the expected structure for submission
      const formDataToSubmit: SubmissionData = {
        user_id: profile.id,
        submitted_at: new Date().toISOString(),
        business_type: userBusinessType,
        business_name: formData.businessName,
        platforms: [
          formattedLandingUrl,
          formattedCreativesLink
        ],
        target_audience: formData.targetAudience,
        location: formData.location,
        type: formData.goal.toLowerCase(),
        description: formData.additionalNotes,
        consent: formData.consent
      };
      
      // Calculate default start date (1-2 days from now)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 2) + 1); // Random 1-2 days
      
      // Calculate default end date (30 days from start date)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 30);

      if (isEditing && brief?.id) {
        // Update existing campaign
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            type: formDataToSubmit.type,
            description: formDataToSubmit.description,
            target_audience: formDataToSubmit.target_audience,
            location: formDataToSubmit.location,
            platforms: formDataToSubmit.platforms,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          })
          .eq('id', brief.id);

        if (updateError) throw updateError;

        // Update local state
        setBrief({
          ...brief,
          type: formDataToSubmit.type,
          description: formDataToSubmit.description,
          target_audience: formDataToSubmit.target_audience,
          location: formDataToSubmit.location,
          platforms: formDataToSubmit.platforms,
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
            type: formDataToSubmit.type,
            budget: 0,
            description: formDataToSubmit.description,
            target_audience: formDataToSubmit.target_audience,
            location: formDataToSubmit.location,
            platforms: formDataToSubmit.platforms,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          })
          .select();

        if (campaignError) throw campaignError;

        // Set the new brief as the existing brief
        if (newCampaign && newCampaign.length > 0) {
          setBrief(newCampaign[0]);
        }

        // Update brief status
        setBriefStatus('Yes');
      }
      
      // Reset form
      setFormData({
        businessName: '',
        targetAudience: '',
        landingPageUrl: '',
        creativesLink: '',
        goal: 'Awareness',
        additionalNotes: '',
        location: '',
        consent: false
      });

      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Error submitting brief:', error);
      setIsSubmitting(false);
    }
  };

  const handleEditBrief = () => {
    // Load existing brief data into the form
    if (brief) {
      // Extract the URLs from platforms array
      const landingPageUrl = brief.platforms?.[0] || '';
      const creativesLink = brief.platforms?.[1] || '';
      
      setFormData({
        businessName: brief.name || '',
        targetAudience: brief.target_audience || '',
        landingPageUrl,
        creativesLink,
        goal: brief.type ? brief.type.charAt(0).toUpperCase() + brief.type.slice(1) : 'Awareness',
        additionalNotes: brief.description || '',
        location: brief.location || '',
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

  // Add handler for deleting a brief
  const handleDeleteBrief = async () => {
    if (!brief?.id) return;
    
    try {
      // Delete the campaign from Supabase
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', brief.id);
      
      if (error) throw error;
      
      // Reset states
      setBrief(null);
      setBriefStatus('No');
      setShowDeleteConfirmation(false);
      
      // Reset form
      setFormData({
        businessName: '',
        targetAudience: '',
        landingPageUrl: '',
        creativesLink: '',
        goal: 'Awareness',
        additionalNotes: '',
        location: '',
        consent: false
      });
      
    } catch (error) {
      console.error('Error deleting brief:', error);
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
          <AccountInfoCard 
            profileEmail={profile.email} 
            createdAt={profile.created_at} 
          />

          {/* Next Steps */}
          <NextStepsCard 
            briefStatus={briefStatus} 
            paymentStatus={paymentStatus} 
          />
        </div>
        
        {/* Your Brief */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="mb-6">
            <BriefHeader 
              existingBrief={brief}
              isEditing={isEditing}
              onEdit={handleEditBrief}
              onDelete={() => setShowDeleteConfirmation(true)}
            />
            {brief && !isEditing && <BriefDisplay brief={brief} />}
          </div>
          
          {showDeleteConfirmation && (
            <DeleteConfirmationDialog
              isOpen={showDeleteConfirmation}
              onCancel={() => setShowDeleteConfirmation(false)}
              onConfirm={handleDeleteBrief}
            />
          )}

          {/* Show BriefForm if no brief exists or if editing */}
          {(brief === null || isEditing) && (
            <BriefForm 
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
              handleChange={handleChange}
              handleCheckboxChange={handleCheckboxChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              currentDate={new Date().toISOString().split('T')[0]}
              defaultEndDate={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
            />
          )}
        </div>
        
        {/* KPI Section */}
        <CampaignPerformanceCard />
      </div>
    </CleanBackground>
  );
} 