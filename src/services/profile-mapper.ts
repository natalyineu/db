import { UserProfile } from '@/types';

/**
 * Service for mapping database profile data to application model
 */
export class ProfileMapper {
  /**
   * Map database profile data to UserProfile type
   * @param data Raw profile data from database
   * @returns Mapped UserProfile object
   */
  static mapProfileData(data: any): UserProfile {
    if (!data) {
      throw new Error('Cannot map null or undefined profile data');
    }

    return {
      id: data.id,
      email: data.email || '',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at,
      status: data.status !== null ? String(data.status) : undefined,
      
      // Additional profile information
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
  }

  /**
   * Creates a default/empty profile 
   * @param userId The user ID for the new profile
   * @param email Optional email for the new profile
   * @returns A default UserProfile object
   */
  static createDefaultProfile(userId: string, email?: string): UserProfile {
    const now = new Date().toISOString();
    
    return {
      id: userId,
      email: email || '',
      created_at: now,
      updated_at: now,
      status: 'active',
      notification_preferences: {
        email: false,
        sms: false,
        push: false
      },
      theme_preference: 'system',
      login_count: 0
    };
  }
}

// Export the function directly for backward compatibility
export const mapProfileData = ProfileMapper.mapProfileData; 