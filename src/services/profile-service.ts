import { UserProfile } from '@/types';
import { ApiClient, fetchWithRetry } from './api-client';
import { captureError } from './error-handler';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// In-memory cache for profiles to reduce database hits
const profileCache = new Map<string, {
  profile: UserProfile;
  timestamp: number;
}>();

// Cache expiry time (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

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
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        if (DEBUG) console.log('ProfileService: Using cached profile for user:', userId);
        return cached.profile;
      }
      
      if (DEBUG) console.log('ProfileService: Fetching profile for user:', userId);
      
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
            if (DEBUG) console.log('ProfileService: No profile found for user:', userId);
            return null;
          }
          
          if (DEBUG) console.log('ProfileService: Profile fetched successfully');
          
          const profile = {
            id: data.id as string,
            email: data.email as string,
            created_at: data.created_at as string,
            updated_at: data.updated_at as string | undefined,
            status: data.status ? String(data.status) : undefined
          };
          
          // Cache the profile
          profileCache.set(userId, {
            profile,
            timestamp: Date.now()
          });
          
          return profile;
        } catch (e) {
          // Only retry on the first attempt
          if (attempt === 0) {
            if (DEBUG) console.log('ProfileService: Retrying profile fetch after error:', e);
            await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
          } else {
            throw e;
          }
        }
      }
      
      // This should never be reached due to the throw in the catch block
      return null;
    } catch (error) {
      throw captureError(error, 'ProfileService.getProfile');
    }
  }
  
  /**
   * Clear the profile cache for a specific user or all users
   */
  static clearCache(userId?: string) {
    if (userId) {
      profileCache.delete(userId);
    } else {
      profileCache.clear();
    }
    
    if (DEBUG) console.log('ProfileService: Cache cleared', userId ? `for user ${userId}` : 'for all users');
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
        updated_at: profileData.updated_at as string | undefined,
        status: profileData.status ? String(profileData.status) : undefined
      };
    } catch (error) {
      throw captureError(error, 'ProfileService.fetchProfileDirectly');
    }
  }
} 