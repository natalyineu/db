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

// Default impression limits by plan
export const PLAN_LIMITS = {
  // Standard plans
  'Starter': 16500,
  'Growth': 46500,
  'Impact': 96500,
  'Tailored': 200000,
  
  // Legacy plans
  'Free': 10000,
  'Basic': 50000,
  'Premium': 250000,
  'Enterprise': 1000000
};

export interface ProfileWithPlan {
  plan?: { 
    impressions_limit: number;
    name?: string;
    payment_status?: string;
    renewal_date?: string;
  };
} 