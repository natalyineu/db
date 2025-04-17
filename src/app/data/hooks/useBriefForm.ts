import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { BriefFormData, FormErrors, UseBriefFormResult, BriefStatus } from './types';
import { validateBriefForm, hasFormErrors } from './useBriefFormValidation';
import { transformFormDataForSubmission, mapBriefToFormData } from './useBriefFormTransform';
import { getImpressionLimit } from './useImpressionLimit';

/**
 * Main hook for brief form functionality
 * @param profile User profile data
 * @param userBusinessType Type of user business
 * @param initialBrief Initial brief data if editing
 * @param onBriefChange Callback when brief changes
 * @param onBriefStatusChange Callback when brief status changes
 * @returns Brief form utilities and state
 */
export function useBriefForm(
  profile: any, 
  userBusinessType: string,
  initialBrief: any,
  onBriefChange: (brief: any | null) => void,
  onBriefStatusChange: (status: BriefStatus) => void,
): UseBriefFormResult {
  const [formData, setFormData] = useState<BriefFormData>(mapBriefToFormData(initialBrief));
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [brief, setBrief] = useState<any>(initialBrief);
  const supabase = createBrowserClient();

  // Sync brief state when initialBrief changes
  useEffect(() => {
    setBrief(initialBrief);
    setFormData(mapBriefToFormData(initialBrief));
  }, [initialBrief]);

  /**
   * Handles input field changes
   */
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
    } else if (name === 'business_name') {
      setFormData(prev => ({
        ...prev,
        businessName: value
      }));
    } else if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        additionalNotes: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Handles checkbox changes
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateBriefForm(formData);
    setFormErrors(validationErrors);
    
    if (hasFormErrors(validationErrors)) {
      console.log('Form has errors:', validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userId = profile?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Transform form data for submission
      const submissionData = transformFormDataForSubmission(
        formData,
        userId,
        userBusinessType
      );
      
      // Add start and end dates
      const dataToSubmit = {
        ...submissionData
      };
      
      let result;
      
      // Update existing brief
      if (isEditing && brief?.id) {
        console.log('Updating existing brief:', brief.id);
        const { data, error } = await supabase
          .from('campaigns')
          .update(dataToSubmit)
          .eq('id', brief.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } 
      // Create new brief
      else {
        console.log('Creating new brief');
        const { data, error } = await supabase
          .from('campaigns')
          .insert(dataToSubmit)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      console.log('Brief submission successful:', result);
      
      // Update brief state
      setBrief(result);
      onBriefChange(result);
      onBriefStatusChange('Yes');
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData(mapBriefToFormData(null));
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting brief:', error);
      alert('An error occurred while submitting your brief. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Switches to editing mode
   */
  const handleEditBrief = () => {
    if (!brief) {
      console.error('No brief to edit');
      return;
    }
    
    console.log('Editing brief:', brief);
    
    // Set form data based on brief
    setFormData(mapBriefToFormData(brief));
    setIsEditing(true);
    onBriefStatusChange('In Progress');
  };

  /**
   * Deletes the current brief
   */
  const handleDeleteBrief = async () => {
    if (!brief?.id) {
      console.error('No brief to delete');
      return;
    }
    
    try {
      console.log('Deleting brief:', brief.id);
      
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', brief.id);
      
      if (error) throw error;
      
      console.log('Brief deleted successfully');
      
      // Reset form and state
      setFormData(mapBriefToFormData(null));
      setBrief(null);
      setIsEditing(false);
      onBriefChange(null);
      onBriefStatusChange('No');
    } catch (error) {
      console.error('Error deleting brief:', error);
      alert('An error occurred while deleting your brief. Please try again.');
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