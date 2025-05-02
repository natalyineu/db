import { UserProfile } from '@/types/profile';
import { ApiClient, fetchWithRetry } from './api-client';
import { captureError } from './error-handler';
import { ProfileMapper } from './profile-mapper';
import { ProfileCache } from './profile-cache';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// Constants for API operation
const FETCH_TIMEOUT = 8000; // 8 seconds timeout
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

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
      
      // Check cache first
      const cachedProfile = ProfileCache.get(userId);
      if (cachedProfile) {
        return cachedProfile;
      }
      
      // Try up to MAX_RETRIES times in case of transient issues
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Set up timeout for the fetch operation
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timed out')), FETCH_TIMEOUT);
          });
          
          // Fetch profile with timeout race
          const fetchPromise = this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          // Race between fetch and timeout
          const { data, error } = await Promise.race([
            fetchPromise,
            timeoutPromise.then(() => { 
              throw new Error('Profile fetch timed out after ' + FETCH_TIMEOUT + 'ms');
            })
          ]) as any;
          
          if (error) {
            throw error;
          }
          
          if (!data) {
            if (DEBUG) console.log('ProfileApi: No profile found for user:', userId);
            return null;
          }
          
          if (DEBUG) console.log('ProfileApi: Profile fetched successfully');
          
          // Map and cache the profile
          const profile = ProfileMapper.mapProfileData(data);
          ProfileCache.set(userId, profile);
          
          return profile;
        } catch (e) {
          // Only retry if not the last attempt
          if (attempt < MAX_RETRIES - 1) {
            if (DEBUG) console.log(`ProfileApi: Retrying profile fetch after error (attempt ${attempt + 1}/${MAX_RETRIES}):`, e);
            await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1))); // Exponential backoff
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
      
      // Attempt to create profile with retry
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
          
          const response = await fetch('/api/ensure-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create profile: ${response.status} - ${errorText}`);
          }
          
          // Fetch the newly created profile
          const profile = await this.fetchProfile(userId);
          
          if (!profile) {
            throw new Error('Profile could not be created');
          }
          
          return profile;
        } catch (e) {
          if (attempt < MAX_RETRIES - 1) {
            if (DEBUG) console.log(`ProfileApi: Retrying profile creation after error (attempt ${attempt + 1}/${MAX_RETRIES}):`, e);
            await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1))); // Exponential backoff
          } else {
            throw e;
          }
        }
      }
      
      throw new Error('Failed to create profile after multiple attempts');
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
      
      // Check cache first for direct fetches too
      const cachedProfile = ProfileCache.get(userId);
      if (cachedProfile) {
        return cachedProfile;
      }
      
      const data = await fetchWithRetry<any[]>(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Prefer': 'return=representation'
          }
        },
        MAX_RETRIES,
        RETRY_DELAY
      );
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // Cache the directly fetched profile too
      const profile = ProfileMapper.mapProfileData(data[0]);
      ProfileCache.set(userId, profile);
      
      return profile;
    } catch (error) {
      throw captureError(error, 'ProfileApi.fetchProfileDirectly');
    }
  }
} 