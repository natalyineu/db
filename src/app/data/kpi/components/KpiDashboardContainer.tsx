'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Link from 'next/link';
import { useKpiData } from './useKpiData';
import { useMetricsCalculation } from './useMetricsCalculation';
import KpiSummary from './KpiSummary';
import MetricsCards from './MetricsCards';
import ChartSection from './ChartSection';
import AccountInfoSection from './AccountInfoSection';
import UsageSection from './UsageSection';
import SummarySection from './SummarySection';

/**
 * Main container component for the KPI dashboard
 * Handles authentication, data loading, and renders dashboard sections
 */
const KpiDashboardContainer = () => {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();

  // Get KPI data using custom hook
  const { 
    kpiData, 
    isLoading: kpiLoading, 
    errorMessage, 
    getProfileWithPlan 
  } = useKpiData(profile);

  // Get the profile with plan information
  const profileWithPlan = getProfileWithPlan();
  const defaultImpressionLimit = profileWithPlan?.plan?.impressions_limit || 16500;

  // Calculate metrics using custom hook
  const { 
    latestMetrics, 
    performanceScores 
  } = useMetricsCalculation(kpiData, defaultImpressionLimit);

  // Combined loading state
  const isLoading = authLoading || profileLoading || kpiLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Loading Dashboard...</h2>
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
          <Link 
            href="/data" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Create Campaign
          </Link>
        </div>
      </div>
    );
  }

  // Render the full dashboard
  return (
    <div className="container mx-auto p-4">
      {/* Header and account info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <KpiSummary 
            kpiData={kpiData}
          />
        </div>
        <div>
          <AccountInfoSection profile={profileWithPlan} />
        </div>
      </div>
      
      {/* Metrics cards */}
      <div className="mb-6">
        <MetricsCards 
          metrics={latestMetrics} 
          isLoading={false}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartSection kpiData={kpiData} />
        <UsageSection 
          profile={profileWithPlan}
          impressions={latestMetrics.impressions}
        />
      </div>
      
      {/* Summary and recommendations */}
      <SummarySection 
        summary={`Your campaign is ${performanceScores.overall}% towards its goal. Impressions are at ${performanceScores.impressions}%, clicks at ${performanceScores.clicks}%, and reach at ${performanceScores.reach}%.`}
      />
    </div>
  );
};

export default KpiDashboardContainer; 