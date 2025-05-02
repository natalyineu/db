import { UserProfile, ProfileUpdatePayload, PublicProfile } from '@/types/profile';

/**
 * Utility class for mapping database records to application profile types and vice versa
 * Ensures consistent formatting and handling of profile data
 */
export class ProfileMapper {
  /**
   * Map a database profile record to a UserProfile 
   */
  static toUserProfile(dbProfile: any): UserProfile | null {
    if (!dbProfile) return null;
    
    return {
      id: dbProfile.id,
      email: dbProfile.email,
      created_at: dbProfile.created_at,
      updated_at: dbProfile.updated_at,
      status: dbProfile.status, // Will be converted to string in UI if needed
      plan: dbProfile.plan || 'Starter',
      first_name: dbProfile.first_name,
      last_name: dbProfile.last_name,
      phone: dbProfile.phone,
      address: dbProfile.address,
      city: dbProfile.city,
      country: dbProfile.country,
      postal_code: dbProfile.postal_code,
      notification_preferences: dbProfile.notification_preferences,
      theme_preference: dbProfile.theme_preference,
      last_login: dbProfile.last_login,
      login_count: dbProfile.login_count,
    };
  }
  
  /**
   * Format a profile for database update
   * Removes read-only fields and formats data for database storage
   */
  static toDbUpdate(profile: ProfileUpdatePayload): any {
    // Remove any properties that shouldn't be in the update
    const { id, created_at, ...updateData } = profile as any;
    
    // Add updated_at timestamp
    return {
      ...updateData,
      updated_at: new Date().toISOString(),
    };
  }
  
  /**
   * Create a PublicProfile from a UserProfile
   * Only includes non-sensitive information suitable for public display
   */
  static toPublicProfile(profile: UserProfile | null): PublicProfile | null {
    if (!profile) return null;
    
    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      plan: typeof profile.plan === 'string' ? profile.plan : undefined
    };
  }
  
  /**
   * Format the status field to a string representation
   */
  static formatStatus(status: number | string | undefined): string {
    if (status === undefined || status === null) return 'unknown';
    
    const statusMap: Record<string, string> = {
      '1': 'active',
      '2': 'suspended',
      '3': 'deactivated'
    };
    
    // Convert to string if it's a number
    const statusStr = String(status);
    
    // Return mapped value or original if no mapping exists
    return statusMap[statusStr] || statusStr;
  }
} 