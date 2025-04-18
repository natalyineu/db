/**
 * Plan types for subscription management
 */

export interface Plan {
  id: number;
  created_at: string;
  updated_at?: string;
  name: string;
  description?: string;
  price: number;
  impressions_limit: number;
  features: Record<string, any>;
}

export interface UserPlan {
  name: string;
  impressions_limit: number;
  payment_status?: string;
  renewal_date?: string;
  id?: number;
} 