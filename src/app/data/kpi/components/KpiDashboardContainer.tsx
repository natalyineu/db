'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import { UserProfile } from '@/types';
import Link from 'next/link';
import { 
  MetricsCards, 
  ChartSection, 
  SummarySection,
  KpiSummary,
  KpiData,
  LatestMetrics,
  PLAN_LIMITS
} from './';

const KpiDashboardContainer = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

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
    
    // If plan name exists but no impressions_limit, use predefined limit based on plan name
    if (profileWithPlan?.plan?.name && !profileWithPlan.plan.impressions_limit) {
      const planName = profileWithPlan.plan.name;
      profileWithPlan.plan.impressions_limit = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || 16500;
    }
    
    return profileWithPlan;
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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
          setSummary('No campaign data available yet.');
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
        const defaultImpressionLimit = profileWithPlan?.plan?.impressions_limit || 16500;
        
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

        // For summary, we can use the description from the first campaign
        const { data: campaignData, error: descError } = await supabase
          .from('campaigns')
          .select('description')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (descError && descError.code !== 'PGRST116') { // Not found error is ok
          console.error('Error fetching campaign description:', descError);
        }

        setKpiData(formattedKpiData);
        setSummary(campaignData?.description || 'No summary available.');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (profile) {
      loadKpiData();
    }
  }, [profile, supabase]);

  // Calculate latest metrics
  const latestMetrics: LatestMetrics = useMemo(() => {
    // Get the profile with plan safely
    const profileWithPlan = getProfileWithPlan();
    const defaultImpressionLimit = 16500;
    
    if (kpiData.length === 0) {
      return {
        impressions: 0,
        impressions_plan: profileWithPlan?.plan?.impressions_limit || defaultImpressionLimit,
        clicks: 0,
        clicks_plan: 0,
        reach: 0,
        reach_plan: 0,
        deltaImpressions: 0,
        deltaClicks: 0,
        deltaReach: 0
      };
    }

    // Get latest metrics (sorted by date descending)
    const latest = kpiData[0];
    
    // Calculate deltas if we have multiple data points
    let deltaImpressions = 0;
    let deltaClicks = 0;
    let deltaReach = 0;
    
    if (kpiData.length > 1) {
      const previous = kpiData[1];
      
      // Avoid division by zero
      if (previous.impressions > 0) {
        deltaImpressions = ((latest.impressions - previous.impressions) / previous.impressions) * 100;
      }
      
      if (previous.clicks > 0) {
        deltaClicks = ((latest.clicks - previous.clicks) / previous.clicks) * 100;
      }
      
      if (previous.reach > 0) {
        deltaReach = ((latest.reach - previous.reach) / previous.reach) * 100;
      }
    }
    
    return {
      impressions: latest.impressions,
      impressions_plan: latest.impressions_plan,
      clicks: latest.clicks,
      clicks_plan: latest.clicks_plan || 0,
      reach: latest.reach,
      reach_plan: latest.reach_plan || 0,
      deltaImpressions,
      deltaClicks,
      deltaReach
    };
  }, [kpiData]);

  // If loading auth or profile, show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 bg-blue-100 rounded mx-auto mb-4"></div>
          <div className="h-4 w-36 bg-blue-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (errorMessage) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Error Loading KPI Data</h2>
        <p className="mb-4 text-red-600">{errorMessage}</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link 
            href="/data" 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Ensure we have profile data
  if (!profile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
        <p className="mb-4">We couldn&apos;t find your profile information.</p>
        <Link 
          href="/data" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen theme-transition">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
                {profile.first_name?.[0] || profile.email[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">KPI Dashboard</h1>
                <p className="text-white/80">
                  Welcome back, {profile.first_name || profile.email.split("@")[0]}
                  {getProfileWithPlan().plan?.name && (
                    <span className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white font-medium rounded-full text-sm">
                      {getProfileWithPlan().plan?.name} Plan
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link 
                href="/data" 
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-all flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Cards Section */}
        <div className="mb-8">
          <MetricsCards 
            metrics={latestMetrics}
            isLoading={isLoading}
          />
        </div>
        
        {/* Campaign Summary Component */}
        <KpiSummary kpiData={kpiData} />
        
        {/* Chart Section */}
        <ChartSection kpiData={kpiData} />
        
        {/* Campaign Summary Section */}
        <SummarySection summary={summary} />
        
        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} AI-Vertise. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/faq" className="text-sm text-gray-500 hover:text-indigo-600">FAQ</a>
              <a href="/privacy-policy" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</a>
              <a href="/terms-of-service" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</a>
              <a href="/cookie-policy" className="text-sm text-gray-500 hover:text-indigo-600">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default KpiDashboardContainer; 