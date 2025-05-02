/**
 * Represents a user profile in the system
 * Used across both client and server-side code
 */
export interface UserProfile {
  // Core user identity (required fields)
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  
  // Account status (numeric in database, string in application)
  status?: number | string; // 1 = active, 2 = suspended, 3 = deactivated 
  
  // Subscription plan
  plan?: string; // 'Starter', 'Professional', 'Enterprise'
  
  // Personal information
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  
  // Preferences and settings
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  theme_preference?: 'light' | 'dark' | 'system';
  
  // Activity tracking
  last_login?: string;
  login_count?: number;
}

/**
 * Profile update payload - subset of UserProfile used for updates
 * Excludes read-only fields like id and created_at
 */
export type ProfileUpdatePayload = Omit<Partial<UserProfile>, 'id' | 'created_at'>;

/**
 * Simplified profile view for public display
 * Only includes non-sensitive information
 */
export interface PublicProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  plan?: string;
} 