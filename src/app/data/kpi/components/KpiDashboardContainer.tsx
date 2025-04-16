'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import { UserProfile } from '@/types';
import Link from 'next/link';
import { 
  AccountInfoSection, 
  UsageSection, 
  MetricsCards, 
  ChartSection, 
  SummarySection,
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

        // Convert the kpi table data to match the expected format
        const formattedKpiData = kpiResults ? kpiResults.map(kpi => ({
          id: kpi.id,
          user_id: profile.id, // Derive from profile
          campaign_id: kpi.campaign_id,
          date: kpi.date,
          impressions: kpi.impressions_fact || 0,
          impressions_plan: kpi.impressions_plan || getProfileWithPlan().plan?.impressions_limit || 16500,
          clicks: kpi.clicks_fact || 0,
          clicks_plan: kpi.clicks_plan || 0,
          reach: kpi.reach_fact || 0,
          reach_plan: kpi.reach_plan || 0,
          delta_impressions: 0, // Can calculate if needed
          delta_clicks: 0,      // Can calculate if needed
          delta_reach: 0,       // Can calculate if needed
          created_at: kpi.created_at
        })) : [];

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
        reach: 0,
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
      reach: latest.reach,
      deltaImpressions,
      deltaClicks,
      deltaReach
    };
  }, [kpiData]);

  // Calculate impressions usage percentage
  const impressionsUsage = Math.min(
    Math.round((latestMetrics.impressions / (latestMetrics.impressions_plan || 1)) * 100), 
    100
  );

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
    <div className="container mx-auto p-6 theme-transition">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
            {profile.first_name?.[0] || profile.email[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">KPI Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile.first_name || profile.email.split("@")[0]}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            href="/data" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </div>

      {/* Account Info Section */}
      <AccountInfoSection profile={profile} />
      
      {/* Usage Section */}
      <UsageSection profile={profile} impressions={latestMetrics.impressions} />
      
      {/* Metrics Cards */}
      <MetricsCards 
        impressions={latestMetrics.impressions}
        impressions_plan={latestMetrics.impressions_plan}
        clicks={latestMetrics.clicks}
        reach={latestMetrics.reach}
        deltaImpressions={latestMetrics.deltaImpressions}
        deltaClicks={latestMetrics.deltaClicks}
        deltaReach={latestMetrics.deltaReach}
      />
      
      {/* Chart Section */}
      <ChartSection kpiData={kpiData} />
      
      {/* Summary Section */}
      <SummarySection summary={summary} />
    </div>
  );
};

export default KpiDashboardContainer; 