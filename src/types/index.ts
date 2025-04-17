export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  status?: string; // User account status
  
  // Plan information
  plan?: {
    name: string;        // e.g., 'Free', 'Basic', 'Premium', 'Enterprise'
    impressions_limit: number;  // Monthly impressions limit
    payment_status?: string;  // e.g., 'active', 'past_due', 'canceled'
    renewal_date?: string;   // Next billing date
  };
  
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

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  url: string;  // Required, default to google.com
  drive_link?: string;  // Optional Google Drive link
  notes?: string;  // Optional comments/notes
  created_at: string;
  updated_at?: string;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export type CampaignType = 'display' | 'search' | 'social' | 'video' | 'email' | 'conversion' | 'awareness' | 'consideration';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  created_at: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
  assets?: CampaignAsset[];
  
  // Additional properties for modern design
  budget: number;
  spent?: number;
  roas?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  description?: string;
  target_audience?: string;
  platforms?: string[];
  performance_score?: number;
} 