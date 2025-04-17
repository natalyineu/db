import { BriefFormData, FormErrors } from './types';

/**
 * Validates the brief form data
 * @param formData The form data to validate
 * @returns Object containing validation errors
 */
export function validateBriefForm(formData: BriefFormData): FormErrors {
  const errors: FormErrors = {};

  // Business name validation is now optional
  // Target audience validation is now optional

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

  // Creatives link validation (if provided and looks like a URL)
  // Accept empty values or simple text like "no"
  if (formData.creativesLink?.trim() && 
      (formData.creativesLink.startsWith('http://') || 
       formData.creativesLink.startsWith('https://'))) {
    try {
      // Only validate as URL if it looks like a URL
      new URL(formData.creativesLink);
    } catch (error) {
      errors.creativesLink = 'Please enter a valid URL or leave blank';
    }
  }

  // Location validation
  if (!formData.location?.trim()) {
    errors.location = 'Please specify your target location';
  }

  // Date validations are now optional
  // Only validate date range if both dates are provided
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