import { UserProfile } from '@/types';

/**
 * Service for mapping database profile data to application model
 */
export class ProfileMapper {
  /**
   * Map database profile data to UserProfile type
   */
  static mapProfileData(data: any): UserProfile {
    return {
      id: data.id as string,
      email: data.email as string,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string | undefined,
      status: data.status ? String(data.status) : undefined,
      
      // Additional profile information if available
      first_name: data.first_name || undefined,
      last_name: data.last_name || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      postal_code: data.postal_code || undefined,
      
      // Preferences and settings if available
      notification_preferences: data.notification_preferences || undefined,
      theme_preference: data.theme_preference || undefined,
      
      // Activity data if available
      last_login: data.last_login || undefined,
      login_count: data.login_count || undefined
    };
  }
} 