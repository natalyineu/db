/**
 * Format a date string for display
 * @param dateString The date string to format
 * @param format Optional format string ('MMM YYYY' for month and year only)
 */
export const formatDate = (dateString?: string, format?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (format === 'MMM YYYY') {
      // Return month and year only
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
    
    return date.toLocaleDateString();
  } catch (e) {
    return 'Invalid date';
  }
};

/**
 * Format profile field for display
 */
export const formatProfileField = (value: any): string => {
  if (value === undefined || value === null || value === '') {
    return 'No data';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return String(value);
}; 