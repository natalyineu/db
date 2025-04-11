import { UserProfile } from '@/types';
import { ApiClient, fetchWithRetry } from './api-client';
import { captureError } from './error-handler';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Service for handling user profile operations
 */
export class ProfileService {
  private static supabase = ApiClient.getSupabaseClient();
  
  /**
   * Fetch a user profile by ID
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (DEBUG) console.log('ProfileService: Fetching profile for user:', userId);
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        if (DEBUG) console.log('ProfileService: No profile found for user:', userId);
        return null;
      }
      
      if (DEBUG) console.log('ProfileService: Profile fetched successfully');
      
      return {
        id: data.id as string,
        email: data.email as string,
        created_at: data.created_at as string,
        updated_at: data.updated_at as string | undefined
      };
    } catch (error) {
      throw captureError(error, 'ProfileService.getProfile');
    }
  }
  
  /**
   * Create a user profile with API
   */
  static async createProfile(userId: string, accessToken: string): Promise<UserProfile> {
    try {
      if (DEBUG) console.log('ProfileService: Creating profile for user:', userId);
      
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
      const profile = await this.getProfile(userId);
      
      if (!profile) {
        throw new Error('Profile could not be created');
      }
      
      return profile;
    } catch (error) {
      throw captureError(error, 'ProfileService.createProfile');
    }
  }
  
  /**
   * Get a profile, creating it if it doesn't exist
   */
  static async getOrCreateProfile(
    userId: string, 
    accessToken: string
  ): Promise<UserProfile> {
    try {
      // Try to get existing profile
      const existingProfile = await this.getProfile(userId);
      
      if (existingProfile) {
        return existingProfile;
      }
      
      // Create new profile if none exists
      return await this.createProfile(userId, accessToken);
    } catch (error) {
      throw captureError(error, 'ProfileService.getOrCreateProfile');
    }
  }
  
  /**
   * Direct API call to fetch profile (fallback method)
   */
  static async fetchProfileDirectly(userId: string): Promise<UserProfile | null> {
    try {
      if (DEBUG) console.log('ProfileService: Direct API fetch for profile:', userId);
      
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
      
      const profileData = data[0];
      
      return {
        id: profileData.id as string,
        email: profileData.email as string,
        created_at: profileData.created_at as string,
        updated_at: profileData.updated_at as string | undefined
      };
    } catch (error) {
      throw captureError(error, 'ProfileService.fetchProfileDirectly');
    }
  }
} 