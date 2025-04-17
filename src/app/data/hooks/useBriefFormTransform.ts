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
  return {
    user_id: userId,
    submitted_at: new Date().toISOString(),
    business_type: businessType,
    name: formData.businessName,
    platforms: [
      formData.landingPageUrl,
      formData.creativesLink
    ].filter(Boolean),
    target_audience: formData.targetAudience,
    location: formData.location,
    type: formData.goal,
    description: formData.additionalNotes,
    consent: formData.consent,
    status: 'offline',
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
    businessName: brief.business_name || '',
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