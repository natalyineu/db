import { UserProfile } from '@/types';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Directly fetch a profile from Supabase using fetch
 */
export const fetchProfileDirect = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (DEBUG) console.log('Direct API fetch for profile:', userId);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const profileData = data[0];
    return mapProfileData(profileData);
  } catch (error) {
    if (DEBUG) console.error('Direct profile fetch error:', error);
    throw error;
  }
};

/**
 * Map database profile data to UserProfile type
 */
export const mapProfileData = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at,
    status: data.status ? String(data.status) : undefined,
    
    // Additional profile information - use empty values rather than fake data
    first_name: data.first_name || undefined,
    last_name: data.last_name || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    postal_code: data.postal_code || undefined,
    
    // Preferences and settings
    notification_preferences: data.notification_preferences || {
      email: false,
      sms: false,
      push: false
    },
    theme_preference: data.theme_preference || 'system',
    
    // Activity data
    last_login: data.last_login || undefined,
    login_count: data.login_count || 0
  };
};

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