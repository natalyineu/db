import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

// Define the interface for the form data
export interface BriefFormData {
  businessName: string;
  targetAudience: string;
  goal: string;
  additionalNotes: string;
  landingPageUrl: string;
  creativesLink: string;
  location: string;
  consent: boolean;
  start_date: string;
  end_date: string;
}

// Interface for form errors
export interface FormErrors {
  [key: string]: string | undefined;
}

// Add a separate interface for the submission data structure
export interface SubmissionData {
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

export interface UseBriefFormResult {
  formData: BriefFormData;
  formErrors: FormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setBrief: (brief: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEditBrief: () => void;
  handleDeleteBrief: () => Promise<void>;
}

export function useBriefForm(
  profile: any, 
  userBusinessType: string,
  initialBrief: any,
  onBriefChange: (brief: any | null) => void,
  onBriefStatusChange: (status: 'No' | 'In Progress' | 'Yes') => void,
): UseBriefFormResult {
  const [formData, setFormData] = useState<BriefFormData>({
    businessName: '',
    targetAudience: '',
    landingPageUrl: '',
    creativesLink: '',
    goal: 'Awareness',
    additionalNotes: '',
    location: '',
    consent: false,
    start_date: '',
    end_date: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [brief, setBrief] = useState<any>(initialBrief);
  const supabase = createBrowserClient();

  // Sync brief state when initialBrief changes
  useEffect(() => {
    setBrief(initialBrief);
  }, [initialBrief]);

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
    } else if (name === 'start_date' || name === 'end_date') {
      // Directly map date fields
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  // Handler for checkbox changes
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
      
      // Get dates from form if provided, otherwise calculate defaults
      let startDate, endDate;
      
      // Use provided start date if available, otherwise default to 1-2 days from now
      if (formData.start_date) {
        startDate = new Date(formData.start_date);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 2) + 1);
      }
      
      // Use provided end date if available, otherwise default to 30 days from start date
      if (formData.end_date) {
        endDate = new Date(formData.end_date);
      } else {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30);
      }

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
        const updatedBrief = {
          ...brief,
          type: formDataToSubmit.type,
          description: formDataToSubmit.description,
          target_audience: formDataToSubmit.target_audience,
          location: formDataToSubmit.location,
          platforms: formDataToSubmit.platforms,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        };
        
        setBrief(updatedBrief);
        onBriefChange(updatedBrief);
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
          onBriefChange(newCampaign[0]);
        }

        // Update brief status
        onBriefStatusChange('Yes');
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
        consent: false,
        start_date: '',
        end_date: '',
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
        consent: true,
        start_date: brief.start_date || '',
        end_date: brief.end_date || '',
      });
      
      setIsEditing(true);
    }
  };

  const handleDeleteBrief = async () => {
    // Use local brief state or initialBrief (in case brief state wasn't synced)
    const briefToDelete = brief || initialBrief;
    
    if (!briefToDelete?.id) {
      console.error('Cannot delete: No brief ID found', { brief, initialBrief });
      return;
    }
    
    try {
      setIsSubmitting(true); // Show loading state during deletion
      
      // Delete the campaign from Supabase
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', briefToDelete.id);
      
      if (error) throw error;
      
      // Reset states
      setBrief(null);
      onBriefChange(null);
      onBriefStatusChange('No');
      
      // Reset form
      setFormData({
        businessName: '',
        targetAudience: '',
        landingPageUrl: '',
        creativesLink: '',
        goal: 'Awareness',
        additionalNotes: '',
        location: '',
        consent: false,
        start_date: '',
        end_date: '',
      });
      
      // Ensure editing mode is turned off
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error deleting brief:', error);
      // Show error toast or notification here if you have a notification system
    } finally {
      setIsSubmitting(false); // Always turn off loading state
    }
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    isEditing,
    setIsEditing,
    setBrief,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    handleEditBrief,
    handleDeleteBrief
  };
} 