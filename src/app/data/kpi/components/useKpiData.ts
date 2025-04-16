import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { KpiData, DEFAULT_IMPRESSION_LIMIT, Plan } from './types';

/**
 * Custom hook to load and format KPI data from Supabase
 * @param profile User profile data
 * @returns KPI data and loading state
 */
export function useKpiData(profile: UserProfile | null) {
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createBrowserClient();

  // Fetch plans data from Supabase
  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('id');

        if (error) {
          console.error('Error fetching plans:', error);
          return;
        }

        setPlans(data as Plan[]);
      } catch (error) {
        console.error('Error in plans fetch:', error);
      }
    }

    fetchPlans();
  }, [supabase]);

  // Helper function to safely access profile.plan with proper type assertion
  const getProfileWithPlan = () => {
    const profileWithPlan = profile as UserProfile & { 
      plan?: { 
        impressions_limit: number;
        name?: string;
        payment_status?: string;
        renewal_date?: string;
      } 
    };
    
    // If plan name exists but no impressions_limit, look up limit from fetched plans
    if (profileWithPlan?.plan?.name && !profileWithPlan.plan.impressions_limit) {
      const planName = profileWithPlan.plan.name;
      const planData = plans.find(p => p.name === planName);
      
      if (planData) {
        profileWithPlan.plan.impressions_limit = planData.impressions_limit;
      } else {
        // Fallback to default if plan not found
        profileWithPlan.plan.impressions_limit = DEFAULT_IMPRESSION_LIMIT;
      }
    }
    
    return profileWithPlan;
  };

  // Load KPI data from Supabase
  useEffect(() => {
    async function loadKpiData() {
      if (!profile?.id) return;

      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        // Fetch KPI data from the existing kpi table
        const { data: userCampaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', profile.id);

        if (campaignError) {
          console.error('Error fetching user campaigns:', campaignError);
          setErrorMessage('Unable to fetch campaign data. Please try again later.');
          setIsLoading(false);
          return;
        }

        if (!userCampaigns || userCampaigns.length === 0) {
          setKpiData([]);
          setIsLoading(false);
          return;
        }

        const campaignIds = userCampaigns.map(c => c.id);
        
        // Fetch KPI data
        const { data: kpiResults, error: kpiError } = await supabase
          .from('kpi')
          .select('*')
          .in('campaign_id', campaignIds)
          .order('date', { ascending: false });

        if (kpiError) {
          console.error('Error fetching KPI data:', kpiError);
          setErrorMessage('Unable to load performance metrics. Please try again later.');
          setIsLoading(false);
          return;
        }

        // Get user's plan information
        const profileWithPlan = getProfileWithPlan();
        const defaultImpressionLimit = profileWithPlan?.plan?.impressions_limit || DEFAULT_IMPRESSION_LIMIT;
        
        // Convert the kpi table data to match the expected format
        const formattedKpiData = kpiResults ? kpiResults.map(kpi => {
          // Use actual plan values if available, otherwise use defaults
          const impressions_plan = kpi.impressions_plan || defaultImpressionLimit;
          const clicks_plan = kpi.clicks_plan || Math.round(impressions_plan * 0.02); // Default 2% CTR
          const reach_plan = kpi.reach_plan || Math.round(impressions_plan * 0.7); // Default 70% of impressions
          
          // Calculate deltas from plan (actual vs plan)
          const delta_impressions = impressions_plan > 0 
            ? ((kpi.impressions_fact || 0) / impressions_plan) * 100
            : 0;
            
          const delta_clicks = clicks_plan > 0 
            ? ((kpi.clicks_fact || 0) / clicks_plan) * 100 
            : 0;
            
          const delta_reach = reach_plan > 0 
            ? ((kpi.reach_fact || 0) / reach_plan) * 100
            : 0;
          
          return {
            id: kpi.id,
            user_id: profile.id,
            campaign_id: kpi.campaign_id,
            date: kpi.date,
            impressions: kpi.impressions_fact || 0,
            impressions_plan: impressions_plan,
            clicks: kpi.clicks_fact || 0,
            clicks_plan: clicks_plan,
            reach: kpi.reach_fact || 0,
            reach_plan: reach_plan,
            delta_impressions,
            delta_clicks,
            delta_reach,
            created_at: kpi.created_at
          };
        }) : [];

        setKpiData(formattedKpiData);
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (profile) {
      loadKpiData();
    } else {
      setIsLoading(false);
    }
  }, [profile, supabase, plans]);

  return {
    kpiData,
    isLoading,
    errorMessage,
    getProfileWithPlan,
    plans
  };
} 