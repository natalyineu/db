export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  status?: string; // User account status
  
  // Additional profile information
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
  
  // Activity data
  last_login?: string;
  login_count?: number;
}

export type ErrorResponse = {
  code: string;
  message: string;
} 