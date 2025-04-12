/**
 * Validates an email address
 */
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!email.includes('@')) {
    return 'Please enter a valid email address';
  }
  
  // More comprehensive email validation if needed
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null; // null means no error
};

/**
 * Validates a password
 */
export const validatePassword = (password: string, minLength: number = 6): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  
  return null; // null means no error
};

/**
 * Validates that two passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null; // null means no error
};

/**
 * Validates a form field is not empty
 */
export const validateRequired = (value: string, fieldName: string = 'This field'): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  
  return null; // null means no error
}; 