import { UserProfile } from '@/types';
import { mapProfileData } from './profile-utils';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Directly fetch a profile from Supabase using fetch
 */
export const fetchProfileDirect = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (DEBUG) console.log('Direct API fetch for profile:', userId);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=*&id=eq.${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Prefer': 'return=representation'
        }
      }
    );
    
    if (!response.ok) {
      if (DEBUG) console.error('Profile fetch response not OK:', response.status, response.statusText);
      throw new Error(`Profile fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      if (DEBUG) console.log('No profile found for user:', userId);
      return null;
    }
    
    const profileData = data[0];
    return mapProfileData(profileData);
  } catch (error) {
    if (DEBUG) console.error('Direct profile fetch error:', error);
    throw error;
  }
}; 