import { UserProfile } from '@/types';
import { ProfileApi } from '@/services/profile-api';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Directly fetch a profile from Supabase using fetch
 * @deprecated Use ProfileApi.fetchProfileDirectly instead
 */
export const fetchProfileDirect = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (DEBUG) console.log('Using deprecated fetchProfileDirect, consider switching to ProfileApi');
    return await ProfileApi.fetchProfileDirectly(userId);
  } catch (error) {
    if (DEBUG) console.error('Direct profile fetch error:', error);
    throw error;
  }
}; 