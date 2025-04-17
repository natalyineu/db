/**
 * Type definitions for KPI components
 */

export interface KpiData {
  id: string;
  user_id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  impressions_plan: number;
  clicks: number;
  clicks_plan: number;
  reach: number;
  reach_plan: number;
  delta_impressions: number;
  delta_clicks: number;
  delta_reach: number;
  created_at: string;
}

export interface LatestMetrics {
  impressions: number;
  impressions_plan: number;
  clicks: number;
  clicks_plan: number;
  reach: number;
  reach_plan: number;
  deltaImpressions: number;
  deltaClicks: number;
  deltaReach: number;
}

export interface PerformanceScores {
  overall: number;
  impressions: number;
  clicks: number;
  reach: number;
}

export interface DashboardProps {
  latestMetrics: LatestMetrics;
  kpiData: KpiData[];
  performanceScores: PerformanceScores;
  isLoading: boolean;
  errorMessage: string | null;
}

// Plan interface matching the Supabase table structure
export interface Plan {
  id: number;
  name: string;
  impressions_limit: number;
  description: string;
  price: number;
}

// Default fallback impression limit if plan data can't be loaded
export const DEFAULT_IMPRESSION_LIMIT = 16500; // Starter plan

export interface ProfileWithPlan {
  plan?: { 
    impressions_limit: number;
    name?: string;
    payment_status?: string;
    renewal_date?: string;
  };
} 