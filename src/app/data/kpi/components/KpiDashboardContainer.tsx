'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { useKpiData } from './useKpiData';
import KpiSummary from './KpiSummary';

/**
 * Main container component for the KPI dashboard
 * Handles authentication, data loading, and renders the campaign summary
 */
const KpiDashboardContainer = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const [creatingKpiData, setCreatingKpiData] = useState(false);
  const supabase = createBrowserClient();

  // Get KPI data using custom hook
  const { 
    kpiData, 
    isLoading: kpiLoading, 
    errorMessage,
    refreshData
  } = useKpiData(profile);

  // Combined loading state
  const isLoading = authLoading || profileLoading || kpiLoading || creatingKpiData;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Function to create KPI data for all campaigns that don't have it
  const createMissingKpiData = async () => {
    if (!profile?.id) return;
    
    try {
      setCreatingKpiData(true);
      
      // Get all campaigns for the user
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('user_id', profile.id);
        
      if (campaignError) {
        console.error('Error fetching campaigns:', campaignError);
        alert('Failed to fetch campaigns');
        return;
      }
      
      if (!campaigns || campaigns.length === 0) {
        alert('No campaigns found');
        return;
      }
      
      console.log('Found campaigns for KPI creation:', campaigns);
      
      // Get user's plan for impression limit
      const { data: userPlans, error: planError } = await supabase
        .from('profiles')
        .select('plan:plan(*)')
        .eq('id', profile.id)
        .single();
        
      if (planError) {
        console.error('Error getting plan info:', planError);
      }
      
      // Default to Starter if plan is not found or doesn't have a name
      const userPlanName = userPlans?.plan && typeof userPlans.plan === 'object' && 'name' in userPlans.plan 
        ? String(userPlans.plan.name) 
        : 'Starter';
      
      // Get impression limit based on plan name
      const { data: planData } = await supabase
        .from('plans')
        .select('impressions_limit')
        .eq('name', userPlanName)
        .single();
        
      const impressionLimit = planData?.impressions_limit || 16500; // Starter plan default
      const defaultImpressions = Math.floor(impressionLimit * 0.8);
      const clicksTarget = Math.floor(defaultImpressions * 0.05);
      const reachTarget = Math.floor(defaultImpressions * 0.8);
      
      // Check which campaigns already have KPI data
      const { data: existingKpi } = await supabase
        .from('kpi')
        .select('campaign_id')
        .in('campaign_id', campaigns.map(c => c.id));
        
      const campaignsWithKpi = new Set(existingKpi?.map(k => k.campaign_id) || []);
      const campaignsNeedingKpi = campaigns.filter(c => !campaignsWithKpi.has(c.id));
      
      console.log('Campaigns needing KPI data:', campaignsNeedingKpi);
      
      if (campaignsNeedingKpi.length === 0) {
        alert('All campaigns already have KPI data');
        refreshData();
        return;
      }
      
      // Create KPI data for each campaign
      const today = new Date().toISOString().split('T')[0];
      const kpiDataToInsert = campaignsNeedingKpi.map(campaign => ({
        campaign_id: campaign.id,
        date: today,
        user_id: profile.id,
        budget_plan: 1000,
        budget_fact: 0,
        budget_percentage: 0,
        impressions_plan: defaultImpressions,
        impressions_fact: 0,
        impressions_percentage: 0,
        clicks_plan: clicksTarget,
        clicks_fact: 0,
        clicks_percentage: 0,
        reach_plan: reachTarget,
        reach_fact: 0,
        reach_percentage: 0
      }));
      
      // Insert KPI data
      const { data: newKpiData, error: insertError } = await supabase
        .from('kpi')
        .insert(kpiDataToInsert)
        .select();
        
      if (insertError) {
        console.error('Error creating KPI data:', insertError);
        alert('Failed to create KPI data');
        return;
      }
      
      console.log('Successfully created KPI data:', newKpiData);
      alert(`Successfully created KPI data for ${newKpiData?.length || 0} campaigns`);
      
      // Refresh the dashboard
      refreshData();
      
    } catch (error) {
      console.error('Error creating KPI data:', error);
      alert('An error occurred while creating KPI data');
    } finally {
      setCreatingKpiData(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {creatingKpiData ? 'Creating KPI Data...' : 'Loading Dashboard...'}
          </h2>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if present
  if (errorMessage) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Dashboard Error</h2>
          <p className="text-red-500">{errorMessage}</p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no campaign data
  if (kpiData.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">No Campaign Data</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You don&apos;t have any campaign data yet. Create a campaign to get started.
          </p>
          <div className="flex space-x-4">
            <Link 
              href="/data" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Create Campaign
            </Link>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh Data
            </button>
            <button
              onClick={createMissingKpiData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create KPI Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render campaign summary with refresh button
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Campaign Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={createMissingKpiData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Missing KPI Data
          </button>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <KpiSummary kpiData={kpiData} />
    </div>
  );
};

export default KpiDashboardContainer; 