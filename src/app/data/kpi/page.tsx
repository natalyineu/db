"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
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

export default function KpiDashboardPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient();

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
        
        // Fetch KPI data from the existing kpi table
        const { data: userCampaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', profile.id);

        if (campaignError) {
          console.error('Error fetching user campaigns:', campaignError);
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

    // Sort by date ascending for chart
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

  if (!profile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Profile Not Found</h2>
        <p className="mb-4">We couldn't find your profile information.</p>
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
    <div className="container mx-auto p-6 bg-gray-50 bg-dots-pattern">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm">
            {profile.first_name?.[0] || profile.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI-Vertise Dashboard</h1>
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
          <div className="flex items-center gap-2 ml-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <span className="w-2 h-2 mr-1 rounded-full bg-purple-600"></span>
              Coffee Shop
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 rounded-full bg-green-600"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Impressions Card */}
        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-70"></div>
          <div className="absolute w-4 h-4 bg-green-100 rounded-full top-12 right-12"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">IMPRESSIONS</h2>
          </div>
          <div className="flex items-baseline justify-between relative z-10">
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
        </div>

        {/* Clicks Card */}
        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-purple-50 rounded-br-full opacity-70"></div>
          <div className="absolute w-4 h-4 bg-purple-100 rounded-full top-12 left-12"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">CLICKS</h2>
          </div>
          <div className="flex items-baseline justify-between relative z-10">
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
        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-50 rounded-tl-full opacity-70"></div>
          <div className="absolute w-5 h-5 bg-blue-100 rounded-full bottom-14 right-16"></div>
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">REACH</h2>
          </div>
          <div className="flex items-baseline justify-between relative z-10">
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-indigo-50 rounded-tr-full opacity-70"></div>
        <div className="absolute w-6 h-6 bg-indigo-100 rounded-full bottom-16 left-16"></div>
        <h2 className="text-xl font-semibold mb-6 flex items-center relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Performance Trend
        </h2>
        {kpiData.length > 0 ? (
          <div className="h-64 relative z-10">
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
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No data available yet</p>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-bl-full opacity-70"></div>
          <div className="absolute w-4 h-4 bg-teal-100 rounded-full top-10 right-12"></div>
          <h2 className="text-xl font-semibold mb-4 flex items-center relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Campaign Summary
          </h2>
          {summary ? (
            <p className="text-gray-600 relative z-10">{summary}</p>
          ) : (
            <p className="text-gray-500 italic relative z-10">No summary available yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-50 rounded-tr-full opacity-70"></div>
          <div className="absolute w-5 h-5 bg-amber-100 rounded-full bottom-14 left-16"></div>
          <h2 className="text-xl font-semibold mb-4 flex items-center relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recommendations
          </h2>
          <ul className="space-y-3 text-gray-600 relative z-10">
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
  );
} 