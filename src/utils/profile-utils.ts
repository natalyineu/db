import { UserProfile } from '@/types';

/**
 * Map database profile data to UserProfile type
 */
export const mapProfileData = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at,
    status: data.status !== null ? String(data.status) : undefined,
    
    // Additional profile information - use empty values rather than fake data
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
}; 