import { UserProfile } from '@/types';
import { captureError } from './error-handler';
import { ProfileCache } from './profile-cache';
import { ProfileApi } from './profile-api';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Service for handling user profile operations
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
        return cachedProfile;
      }
      
      // Fetch from database if not in cache
      return await ProfileApi.fetchProfile(userId);
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
   * Create a user profile with API
   */
  static async createProfile(userId: string, accessToken: string): Promise<UserProfile> {
    try {
      return await ProfileApi.createProfile(userId, accessToken);
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
      return await ProfileApi.fetchProfileDirectly(userId);
    } catch (error) {
      throw captureError(error, 'ProfileService.fetchProfileDirectly');
    }
  }
} 