import { BriefFormData, FormErrors } from './types';

/**
 * Validates the brief form data
 * @param formData The form data to validate
 * @returns Object containing validation errors
 */
export function validateBriefForm(formData: BriefFormData): FormErrors {
  const errors: FormErrors = {};

  // Business name validation
  if (!formData.businessName?.trim()) {
    errors.businessName = 'Please enter your business name';
  }

  // Target audience validation
  if (!formData.targetAudience?.trim()) {
    errors.targetAudience = 'Please describe your target audience';
  }

  // Goal validation
  if (!formData.goal?.trim()) {
    errors.goal = 'Please select a campaign goal';
  }

  // Landing page URL validation
  if (formData.landingPageUrl?.trim()) {
    try {
      // Simple URL validation
      new URL(formData.landingPageUrl);
    } catch (error) {
      errors.landingPageUrl = 'Please enter a valid URL';
    }
  }

  // Creatives link validation (if provided)
  if (formData.creativesLink?.trim()) {
    try {
      // Simple URL validation
      new URL(formData.creativesLink);
    } catch (error) {
      errors.creativesLink = 'Please enter a valid URL';
    }
  }

  // Location validation
  if (!formData.location?.trim()) {
    errors.location = 'Please specify your target location';
  }

  // Date validations
  if (!formData.start_date) {
    errors.start_date = 'Please specify a start date';
  }

  if (!formData.end_date) {
    errors.end_date = 'Please specify an end date';
  }

  // Compare dates if both exist
  if (formData.start_date && formData.end_date) {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (endDate < startDate) {
      errors.end_date = 'End date must be after start date';
    }
  }

  // Consent validation
  if (!formData.consent) {
    errors.consent = 'You must agree to the terms';
  }

  return errors;
}

/**
 * Checks if the form has any validation errors
 * @param errors The form errors object
 * @returns True if the form has errors, false otherwise
 */
export function hasFormErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(error => !!error);
} 