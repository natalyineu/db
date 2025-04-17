import { BriefFormData, SubmissionData } from './types';

/**
 * Transforms the form data into the format expected by the API
 * @param formData The form data from the UI
 * @param userId The user ID
 * @param businessType The business type
 * @returns Transformed data ready for submission
 */
export function transformFormDataForSubmission(
  formData: BriefFormData,
  userId: string,
  businessType: string
): SubmissionData {
  // Maps goal values to CampaignType
  const getCampaignType = (goal: string) => {
    // Convert to lowercase for case-insensitive matching
    const normalizedGoal = goal.toLowerCase();
    
    // Map goals to campaign types
    if (normalizedGoal.includes('awareness')) return 'awareness';
    if (normalizedGoal.includes('conversion')) return 'conversion';
    if (normalizedGoal.includes('consideration')) return 'awareness'; // Default to awareness for consideration
    
    // Default to display for any other goal
    return 'display';
  };

  // Set default dates if not provided
  const today = new Date();
  
  // Default start date: 2 days from today
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(today.getDate() + 2);
  
  // Default end date: 30 days after start date
  const startDate = formData.start_date ? new Date(formData.start_date) : defaultStartDate;
  const defaultEndDate = new Date(startDate);
  defaultEndDate.setDate(startDate.getDate() + 30);
  
  // Format dates as YYYY-MM-DD
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Prepare submission data that matches the campaigns table structure
  const submissionData: SubmissionData = {
    user_id: userId,
    name: formData.businessName?.trim() || "New Campaign",
    status: 'draft', // Default to draft status
    type: getCampaignType(formData.goal), // Convert goal to valid CampaignType
    budget: 0, // Default budget value
    // Always set dates, using defaults if not provided
    start_date: formData.start_date || formatDate(defaultStartDate),
    end_date: formData.end_date || formatDate(defaultEndDate)
  };

  // Add optional fields only if they have values
  if (formData.additionalNotes) submissionData.description = formData.additionalNotes;
  if (formData.targetAudience) submissionData.target_audience = formData.targetAudience;
  if (formData.location) submissionData.location = formData.location;
  
  // Add platforms only if at least one URL is provided
  const platformUrls = [formData.landingPageUrl, formData.creativesLink].filter(Boolean);
  if (platformUrls.length > 0) {
    submissionData.platforms = platformUrls;
  }

  return submissionData;
}

/**
 * Maps the brief data from the database to the form data format
 * @param brief The brief data from the database
 * @returns Form data object for the UI
 */
export function mapBriefToFormData(brief: any): BriefFormData {
  if (!brief) {
    return {
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
    };
  }

  const platforms = brief.platforms || [];
  
  return {
    businessName: brief.name || '', // Changed from business_name to name
    targetAudience: brief.target_audience || '',
    landingPageUrl: platforms[0] || '',
    creativesLink: platforms[1] || '',
    goal: brief.type || 'Awareness',
    additionalNotes: brief.description || '',
    location: brief.location || '',
    consent: brief.consent || false,
    start_date: brief.start_date || '',
    end_date: brief.end_date || '',
  };
} 