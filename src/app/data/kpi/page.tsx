"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import { CleanBackground } from '@/components/ui';
import { UserProfile } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// KPI data interface
interface KpiData {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  reach: number;
  delta_impressions?: number;
  delta_clicks?: number;
  delta_reach?: number;
  created_at: string;
}

// Define fixed plans with their impression limits
const PLAN_LIMITS = {
  'Starter': 16500,
  'Growth': 46500,
  'Impact': 96500,
  'Tailored': 200000,
  'Free': 1000
};

export default function KpiDashboardPage() {
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
          clicks: kpi.clicks_fact || 0,
          reach: kpi.reach_fact || 0,
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
  const latestMetrics = useMemo(() => {
    if (kpiData.length === 0) {
      return {
        impressions: 0,
        clicks: 0,
        reach: 0,
        deltaImpressions: 0,
        deltaClicks: 0,
        deltaReach: 0
      };
    }

    const latest = kpiData[0];
    
    return {
      impressions: latest.impressions,
      clicks: latest.clicks,
      reach: latest.reach,
      deltaImpressions: latest.delta_impressions || 0,
      deltaClicks: latest.delta_clicks || 0,
      deltaReach: latest.delta_reach || 0
    };
  }, [kpiData]);

  // Calculate plan usage percentage
  const impressionsUsage = useMemo(() => {
    const profileWithPlan = getProfileWithPlan();
    
    if (!profileWithPlan?.plan?.impressions_limit) return 0;
    return Math.min(100, Math.round((latestMetrics.impressions / profileWithPlan.plan.impressions_limit) * 100));
  }, [latestMetrics.impressions, profile]);

  // Determine if showing upgrade recommendation
  const showUpgradeRecommendation = useMemo(() => {
    return impressionsUsage >= 80; // Show upgrade options if usage is high
  }, [impressionsUsage]);

  // Get next tier plan based on current plan
  const getNextTierPlan = useMemo(() => {
    const profileWithPlan = getProfileWithPlan();
    
    if (!profileWithPlan?.plan?.name) return 'Growth';
    
    switch(profileWithPlan.plan.name) {
      case 'Starter': return 'Growth';
      case 'Growth': return 'Impact';
      case 'Impact': return 'Tailored';
      default: return 'Tailored';
    }
  }, [profile]);

  // Get impressions limit for the next tier
  const getNextTierImpressions = useMemo(() => {
    switch(getNextTierPlan) {
      case 'Growth': return 46500;
      case 'Impact': return 96500;
      case 'Tailored': return 100000;
      default: return 46500;
    }
  }, [getNextTierPlan]);

  // Prepare chart data
  const chartData: ChartData<'line'> = useMemo(() => {
    if (kpiData.length === 0) {
      // Empty data
      return {
        labels: [],
        datasets: [
          {
            label: 'Impressions',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Clicks',
            data: [],
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
          },
          {
            label: 'Reach',
            data: [],
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
          },
        ],
      };
    }
    
    // Sort data by date (oldest to newest)
    const sortedData = [...kpiData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get last 7 days data (or less if not available)
    const chartKpiData = sortedData.slice(-7);
    
    return {
      labels: chartKpiData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Impressions',
          data: chartKpiData.map(d => d.impressions),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Clicks',
          data: chartKpiData.map(d => d.clicks),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
        {
          label: 'Reach',
          data: chartKpiData.map(d => d.reach),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
        },
      ],
    };
  }, [kpiData]);

  // Combined loading state
  const loading = authLoading || profileLoading || isLoading;

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 bg-blue-100 rounded mx-auto mb-4"></div>
          <div className="h-4 w-36 bg-blue-100 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <CleanBackground>
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading KPI Data</h2>
          <p className="mb-4 text-red-600">{errorMessage}</p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              onClick={() => router.push('/data')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </CleanBackground>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
        <p className="mb-4">We couldn&apos;t find your profile information.</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => router.push('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <CleanBackground>
      <div className="container mx-auto p-6 theme-transition">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
              {profile.first_name?.[0] || profile.email[0].toUpperCase()}
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
              Back to Overview
            </Link>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Current Plan</h3>
              <div className="flex items-center">
                <p className="text-lg font-semibold">
                  {getProfileWithPlan().plan?.name || 'Starter'}
                </p>
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  {getProfileWithPlan().plan?.impressions_limit?.toLocaleString()} impressions
                </span>
              </div>
              <div className="mt-2 flex space-x-2">
                <Link 
                  href="/account/plans" 
                  className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  View Plans
                </Link>
                {getProfileWithPlan().plan?.name !== 'Tailored' && (
                  <button className="text-xs px-2 py-1 border border-indigo-300 rounded hover:bg-indigo-50 text-indigo-700">
                    Upgrade
                  </button>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  getProfileWithPlan().plan?.payment_status === 'active' ? 'bg-green-500' :
                  getProfileWithPlan().plan?.payment_status === 'past_due' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></span>
                <p className="text-lg font-semibold">
                  {getProfileWithPlan().plan?.payment_status === 'active' ? 'Active' :
                   getProfileWithPlan().plan?.payment_status === 'past_due' ? 'Past Due' :
                   getProfileWithPlan().plan?.payment_status === 'canceled' ? 'Canceled' : 'Not Available'}
                </p>
              </div>
              <div className="mt-2">
                <Link 
                  href="/account/billing" 
                  className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                >
                  Billing History
                </Link>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Next Billing Date</h3>
              <p className="text-lg font-semibold">
                {getProfileWithPlan().plan?.renewal_date 
                  ? new Date(String(getProfileWithPlan().plan?.renewal_date)).toLocaleDateString() 
                  : 'Not Available'
                }
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Your subscription will renew automatically
              </div>
            </div>
          </div>
        </div>

        {/* Impressions Usage Meter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Impressions Usage</h2>
            <span className="text-sm text-gray-500">
              {latestMetrics.impressions.toLocaleString()} / {getProfileWithPlan().plan?.impressions_limit?.toLocaleString() || '∞'} impressions
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${
                impressionsUsage < 70 ? 'bg-green-500' :
                impressionsUsage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${impressionsUsage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
          
          {showUpgradeRecommendation && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-indigo-800">You&apos;re approaching your plan limit</h3>
                  <p className="text-xs text-indigo-600 mt-1">
                    You&apos;ve used {impressionsUsage}% of your current {getProfileWithPlan().plan?.name || 'Starter'} plan&apos;s impressions. 
                    Consider upgrading to our {getNextTierPlan} plan with {getNextTierImpressions.toLocaleString()} impressions.
                  </p>
                  <div className="mt-2">
                    <button className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Impressions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">IMPRESSIONS</h2>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{latestMetrics.impressions.toLocaleString()}</span>
              {latestMetrics.deltaImpressions !== 0 && (
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                  latestMetrics.deltaImpressions > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {latestMetrics.deltaImpressions > 0 ? '+' : ''}{latestMetrics.deltaImpressions.toFixed(1)}%
                </span>
              )}
            </div>
            {getProfileWithPlan().plan?.impressions_limit && (
              <div className="mt-2 text-xs text-gray-500">
                Plan: {getProfileWithPlan().plan?.impressions_limit?.toLocaleString() || 0} / Actual: {latestMetrics.impressions.toLocaleString()}
              </div>
            )}
          </div>

          {/* Clicks Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">CLICKS</h2>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{latestMetrics.clicks.toLocaleString()}</span>
              {latestMetrics.deltaClicks !== 0 && (
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                  latestMetrics.deltaClicks > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {latestMetrics.deltaClicks > 0 ? '+' : ''}{latestMetrics.deltaClicks.toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Reach Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">REACH</h2>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{latestMetrics.reach.toLocaleString()}</span>
              {latestMetrics.deltaReach !== 0 && (
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                  latestMetrics.deltaReach > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {latestMetrics.deltaReach > 0 ? '+' : ''}{latestMetrics.deltaReach.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Performance Trend</h2>
          {kpiData.length > 0 ? (
            <div className="h-64">
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">No data available yet</p>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Summary</h2>
            {summary ? (
              <p className="text-gray-600">{summary}</p>
            ) : (
              <p className="text-gray-500 italic">No summary available yet.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Consider increasing your budget allocation to high-performing ad groups.</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Optimize your ads for mobile users to increase engagement rates.</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Implement A/B testing for your ad creatives to identify the best performing visuals.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </CleanBackground>
  );
} 