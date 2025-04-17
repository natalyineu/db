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

  return {
    user_id: userId,
    submitted_at: new Date().toISOString(),
    name: formData.businessName,
    platforms: [
      formData.landingPageUrl,
      formData.creativesLink
    ].filter(Boolean),
    target_audience: formData.targetAudience,
    location: formData.location,
    type: getCampaignType(formData.goal), // Convert goal to valid CampaignType
    description: formData.additionalNotes,
    consent: formData.consent,
    status: 'offline',
    budget: 0, // Add required budget field with default value
  };
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