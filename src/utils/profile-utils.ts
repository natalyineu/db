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
    status: data.status ? String(data.status) : undefined
  };
};

/**
 * Format a date string for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return 'Invalid date';
  }
}; 