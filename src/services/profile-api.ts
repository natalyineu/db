import { UserProfile } from '@/types';
import { ApiClient, fetchWithRetry } from './api-client';
import { captureError } from './error-handler';
import { ProfileMapper } from './profile-mapper';
import { ProfileCache } from './profile-cache';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Service for handling API interactions for user profiles
 */
export class ProfileApi {
  private static supabase = ApiClient.getSupabaseClient();
  
  /**
   * Fetch a user profile directly from the database
   */
  static async fetchProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (DEBUG) console.log('ProfileApi: Fetching profile for user:', userId);
      
      // Try up to 2 times in case of transient issues
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (!data) {
            if (DEBUG) console.log('ProfileApi: No profile found for user:', userId);
            return null;
          }
          
          if (DEBUG) console.log('ProfileApi: Profile fetched successfully');
          
          // Map and return the profile
          const profile = ProfileMapper.mapProfileData(data);
          
          // Cache the profile
          ProfileCache.set(userId, profile);
          
          return profile;
        } catch (e) {
          // Only retry on the first attempt
          if (attempt === 0) {
            if (DEBUG) console.log('ProfileApi: Retrying profile fetch after error:', e);
            await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
          } else {
            throw e;
          }
        }
      }
      
      // This should never be reached due to the throw in the catch block
      return null;
    } catch (error) {
      throw captureError(error, 'ProfileApi.fetchProfile');
    }
  }
  
  /**
   * Create a user profile with API
   */
  static async createProfile(userId: string, accessToken: string): Promise<UserProfile> {
    try {
      if (DEBUG) console.log('ProfileApi: Creating profile for user:', userId);
      
      const response = await fetch('/api/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create profile: ${errorText}`);
      }
      
      // Fetch the newly created profile
      const profile = await this.fetchProfile(userId);
      
      if (!profile) {
        throw new Error('Profile could not be created');
      }
      
      return profile;
    } catch (error) {
      throw captureError(error, 'ProfileApi.createProfile');
    }
  }
  
  /**
   * Direct API call to fetch profile (fallback method)
   */
  static async fetchProfileDirectly(userId: string): Promise<UserProfile | null> {
    try {
      if (DEBUG) console.log('ProfileApi: Direct API fetch for profile:', userId);
      
      const data = await fetchWithRetry<any[]>(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
          }
        }
      );
      
      if (!data || data.length === 0) {
        return null;
      }
      
      return ProfileMapper.mapProfileData(data[0]);
    } catch (error) {
      throw captureError(error, 'ProfileApi.fetchProfileDirectly');
    }
  }
} 