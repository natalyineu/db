/**
 * Plan types for subscription management
 */

export interface Plan {
  id: number;
  name: string;
  impressions_limit: number;
  description?: string;
  price?: number;
  features?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserPlan {
  name: string;
  impressions_limit: number;
  payment_status?: string;
  renewal_date?: string;
  id?: number;
} 