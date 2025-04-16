export interface KpiData {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  impressions_plan: number;
  clicks: number;
  clicks_plan: number;
  reach: number;
  reach_plan: number;
  delta_impressions?: number;
  delta_clicks?: number;
  delta_reach?: number;
  created_at: string;
}

export interface LatestMetrics {
  impressions: number;
  impressions_plan: number;
  clicks: number;
  reach: number;
  deltaImpressions: number;
  deltaClicks: number;
  deltaReach: number;
}

export interface ProfileWithPlan {
  plan?: { 
    impressions_limit: number;
    name?: string;
    payment_status?: string;
    renewal_date?: string;
  };
}

export const PLAN_LIMITS = {
  'Starter': 16500,
  'Growth': 46500,
  'Impact': 96500,
  'Tailored': 200000
}; 