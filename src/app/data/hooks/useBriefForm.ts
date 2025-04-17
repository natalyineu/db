import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { BriefFormData, FormErrors, UseBriefFormResult, BriefStatus } from './types';
import { validateBriefForm, hasFormErrors } from './useBriefFormValidation';
import { transformFormDataForSubmission, mapBriefToFormData } from './useBriefFormTransform';
import { getImpressionLimit } from './useImpressionLimit';
import { KpiService } from '@/services';

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
    } else if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        goal: value
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
   * Creates initial KPI data for a campaign
   */
  const createInitialKpiData = async (campaignId: string) => {
    try {
      // Get plan information from profile
      const userPlanName = profile?.plan?.name || 'Starter'; // Default to Starter if no plan name is found
      console.log('User plan name:', userPlanName);
      
      // Get impression limit based on plan name from the plans table
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('impressions_limit')
        .eq('name', userPlanName)
        .single();
      
      if (planError) {
        console.error('Error fetching plan data:', planError);
        throw planError;
      }
      
      // Use the plan's impression limit or fallback to a default value
      const impressionLimit = planData?.impressions_limit || 16500; // Starter plan default
      console.log('Using impression limit from plan:', impressionLimit);
      
      const defaultImpressions = Math.floor(impressionLimit * 0.8);
      const clicksTarget = Math.floor(defaultImpressions * 0.05);
      const reachTarget = Math.floor(defaultImpressions * 0.8);
      
      // Calculate default percentages (all zero since fact values are zero)
      const budgetPercentage = 0;
      const impressionsPercentage = 0;
      const clicksPercentage = 0;
      const reachPercentage = 0;
      
      // Direct Supabase insert instead of using KpiService
      const today = new Date().toISOString().split('T')[0]; // Today's date
      
      // Log the KPI data before inserting
      const kpiData = {
        campaign_id: campaignId,
        date: today,
        user_id: profile?.id,
        budget_plan: 1000,
        budget_fact: 0,
        budget_percentage: budgetPercentage,
        impressions_plan: defaultImpressions,
        impressions_fact: 0,
        impressions_percentage: impressionsPercentage,
        clicks_plan: clicksTarget,
        clicks_fact: 0,
        clicks_percentage: clicksPercentage,
        reach_plan: reachTarget,
        reach_fact: 0,
        reach_percentage: reachPercentage
      };
      
      console.log('Inserting KPI data:', kpiData);
      
      // Direct Supabase insert
      const { data: insertResult, error: insertError } = await supabase
        .from('kpi')
        .insert(kpiData)
        .select() // Return the inserted record
        .single();
      
      if (insertError) {
        console.error('Error inserting KPI data:', insertError);
        throw insertError;
      }
      
      console.log('Successfully created KPI data with ID:', insertResult?.id);
      
      // Force reload of KPI data for the dashboard
      if (typeof window !== 'undefined' && window.localStorage) {
        // Set a flag to indicate new KPI data was created
        window.localStorage.setItem('kpi_data_updated', 'true');
        window.localStorage.setItem('kpi_campaign_id', campaignId);
      }
      
      return insertResult;
    } catch (error) {
      console.error('Error creating initial KPI data:', error);
      // Don't throw the error to avoid interrupting the main flow
      return null;
    }
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
        
        // Create initial KPI data for new campaign
        await createInitialKpiData(result.id);
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