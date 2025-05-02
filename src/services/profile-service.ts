import { UserProfile, ProfileUpdatePayload } from '@/types/profile';
import { captureError } from './error-handler';
import { ProfileCache } from './profile-cache';
import { createAdminClient } from '@/lib/supabase/client';
import { ProfileMapper } from '@/utils/profile-mapper';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Service for handling user profile operations
 * Single source of truth for all profile-related functionality
 */
export class ProfileService {
  /**
   * Fetch a user profile by ID
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check cache first
      const cachedProfile = ProfileCache.get(userId);
      if (cachedProfile) {
        if (DEBUG) console.log('[ProfileService] Cache hit for user:', userId);
        return cachedProfile;
      }
      
      if (DEBUG) console.log('[ProfileService] Cache miss, fetching from database:', userId);
      
      // Fetch from database if not in cache
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }
      
      if (!data) return null;
      
      // Map database record to UserProfile using the mapper
      const profile = ProfileMapper.toUserProfile(data);
      
      // Store in cache if not null
      if (profile) {
        ProfileCache.set(userId, profile);
      }
      
      return profile;
    } catch (error) {
      throw captureError(error, 'ProfileService.getProfile');
    }
  }
  
  /**
   * Clear the profile cache for a specific user or all users
   */
  static clearCache(userId?: string) {
    ProfileCache.clear(userId);
  }
  
  /**
   * Create a user profile
   */
  static async createProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      if (DEBUG) console.log('[ProfileService] Creating profile for user:', userId);
      
      const supabase = createAdminClient();
      
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          created_at: new Date().toISOString(),
          status: 1,  // Using numeric value 1 for active status
          plan: 'Starter'
        })
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Profile created but no data returned');
      }
      
      // Map the profile data using the mapper
      const profile = ProfileMapper.toUserProfile(data[0]);
      
      if (!profile) {
        throw new Error('Profile creation failed - could not map data');
      }
      
      // Store in cache
      ProfileCache.set(userId, profile);
      
      return profile;
    } catch (error) {
      throw captureError(error, 'ProfileService.createProfile');
    }
  }
  
  /**
   * Get a profile, creating it if it doesn't exist
   */
  static async ensureProfile(userId: string, email: string): Promise<UserProfile> {
    try {
      // Try to get existing profile
      const existingProfile = await this.getProfile(userId);
      
      if (existingProfile) {
        return existingProfile;
      }
      
      // Create new profile if none exists
      return await this.createProfile(userId, email);
    } catch (error) {
      throw captureError(error, 'ProfileService.ensureProfile');
    }
  }
  
  /**
   * Update a user profile
   */
  static async updateProfile(
    userId: string, 
    profileData: ProfileUpdatePayload
  ): Promise<UserProfile> {
    try {
      if (DEBUG) console.log('[ProfileService] Updating profile for user:', userId);
      
      const supabase = createAdminClient();
      
      // Format the update data using the mapper
      const updateData = ProfileMapper.toDbUpdate(profileData);
      
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Profile updated but no data returned');
      }
      
      // Clear cache for this user
      this.clearCache(userId);
      
      // Map and return the updated profile
      const profile = ProfileMapper.toUserProfile(data[0]);
      
      if (!profile) {
        throw new Error('Profile update failed - could not map data');
      }
      
      return profile;
    } catch (error) {
      throw captureError(error, 'ProfileService.updateProfile');
    }
  }
} 