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
    // Simplified URL validation that accepts domains without http/https
    // First check if it's a valid URL as is
    let isValid = false;
    try {
      new URL(formData.landingPageUrl);
      isValid = true;
    } catch (error) {
      // If not valid, try with https:// prefix
      try {
        new URL(`https://${formData.landingPageUrl}`);
        isValid = true;
      } catch (innerError) {
        isValid = false;
      }
    }

    if (!isValid) {
      errors.landingPageUrl = 'Please enter a valid URL or domain';
    }
  }

  // Creatives link validation (if provided)
  // Accept empty values, simple text like "no", or URLs/domains
  if (formData.creativesLink?.trim() && 
      formData.creativesLink.toLowerCase() !== 'no') {
    let isValid = false;
    try {
      new URL(formData.creativesLink);
      isValid = true;
    } catch (error) {
      // Try with https:// prefix
      try {
        new URL(`https://${formData.creativesLink}`);
        isValid = true;
      } catch (innerError) {
        isValid = false;
      }
    }

    if (!isValid) {
      errors.creativesLink = 'Please enter a valid URL, domain, or "no"';
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