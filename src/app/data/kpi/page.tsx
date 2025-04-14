"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { RobotLoader, ErrorDisplay } from '@/components/ui';
import { Campaign, CampaignKPI } from '@/types';
import { CampaignService } from '@/services/campaign-service';
import { KpiService } from '@/services/kpi-service';
import { useProfile } from '@/hooks/useProfile';
import { Card, DashboardHeader } from '@/features/shared/ui';
import KpiMetricCard from '@/components/ui/KpiMetricCard';
import AddKpiForm from '@/components/ui/AddKpiForm';

// KPI Trend visualization component
const KpiTrendChart = ({ data, metricKey }: { data: CampaignKPI[], metricKey: 'budget' | 'impressions' | 'clicks' | 'reach' }) => {
  // Sort by date ascending for the chart
  const sortedData = useMemo(() => [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ), [data]);

  // Only show last 7 entries
  const chartData = useMemo(() => sortedData.slice(-7), [sortedData]);

  // Color mapping
  const colorMap = {
    budget: 'from-blue-500 to-blue-300',
    impressions: 'from-green-500 to-green-300',
    clicks: 'from-purple-500 to-purple-300',
    reach: 'from-orange-500 to-orange-300',
  };

  // No data check
  if (chartData.length === 0) return (
    <div className="text-center py-8 rounded-md bg-gray-50 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">No historical data available</p>
    </div>
  );

  // Calculate max value for scaling
  const maxValue = Math.max(...chartData.map(item => item[metricKey].fact));
  
  return (
    <div className="pt-6">
      <h4 className="text-sm font-medium text-primary mb-4">Recent {metricKey.charAt(0).toUpperCase() + metricKey.slice(1)} Trend</h4>
      <div className="relative h-40">
        <div className="absolute inset-0 flex items-end justify-between">
          {chartData.map((item, index) => {
            const percentage = maxValue ? (item[metricKey].fact / maxValue) * 100 : 0;
            return (
              <div key={`${item.id}-${index}`} className="flex flex-col items-center w-1/7 px-1">
                <div 
                  className={`w-full rounded-t-sm bg-gradient-to-t ${colorMap[metricKey]}`} 
                  style={{ height: `${Math.max(percentage, 5)}%` }}
                ></div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                  {new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// KPI Summary card component
const KpiSummary = ({ kpiData }: { kpiData: CampaignKPI[] }) => {
  // Calculate aggregated statistics
  const stats = useMemo(() => {
    if (kpiData.length === 0) return null;
    
    // Calculate averages and totals
    const totalBudget = kpiData.reduce((sum, kpi) => sum + kpi.budget.fact, 0);
    const totalImpressions = kpiData.reduce((sum, kpi) => sum + kpi.impressions.fact, 0);
    const totalClicks = kpiData.reduce((sum, kpi) => sum + kpi.clicks.fact, 0);
    const totalReach = kpiData.reduce((sum, kpi) => sum + kpi.reach.fact, 0);
    
    // Calculate CTR (Click-Through Rate)
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // Calculate CPC (Cost Per Click)
    const cpc = totalClicks > 0 ? totalBudget / totalClicks : 0;
    
    // Calculate CPM (Cost Per Mille/Thousand Impressions)
    const cpm = totalImpressions > 0 ? (totalBudget / totalImpressions) * 1000 : 0;
    
    return { totalBudget, totalImpressions, totalClicks, totalReach, ctr, cpc, cpm };
  }, [kpiData]);

  if (!stats) return null;

  return (
    <Card className="bg-white dark:bg-card border border-gray-200 dark:border-gray-700 shadow-app-sm theme-transition">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-secondary mb-1">CTR</p>
            <p className="text-2xl font-bold text-primary">{stats.ctr.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-1">CPC</p>
            <p className="text-2xl font-bold text-primary">${stats.cpc.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-1">CPM</p>
            <p className="text-2xl font-bold text-primary">${stats.cpm.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-1">Conversion</p>
            <p className="text-2xl font-bold text-primary">~{(stats.totalClicks > 0 ? (stats.totalReach / stats.totalClicks) * 100 : 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function KpiDashboard() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile(3);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<CampaignKPI[]>([]);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const router = useRouter();

  // Combined loading state
  const isLoading = authLoading || profileLoading;
  
  // Filter KPI data based on active timeframe
  const filteredKpiData = useMemo(() => {
    if (activeTimeframe === 'all') return kpiData;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (activeTimeframe === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (activeTimeframe === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    }
    
    return kpiData.filter(kpi => new Date(kpi.date) >= cutoffDate);
  }, [kpiData, activeTimeframe]);
  
  // Load campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      if (!profile) return;
      
      setCampaignsLoading(true);
      try {
        const userCampaigns = await CampaignService.getCampaignsByUserId(profile.id);
        setCampaigns(userCampaigns);
        
        // Auto-select the first campaign
        if (userCampaigns.length > 0 && !selectedCampaign) {
          setSelectedCampaign(userCampaigns[0].id);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setCampaignsLoading(false);
      }
    };
    
    if (profile) {
      loadCampaigns();
    }
  }, [profile, selectedCampaign]);
  
  // Load KPI data when selected campaign changes
  useEffect(() => {
    const loadKpiData = async () => {
      if (!selectedCampaign) return;
      
      setKpiLoading(true);
      try {
        const kpis = await KpiService.getKpiByCampaignId(selectedCampaign);
        setKpiData(kpis);
      } catch (error) {
        console.error('Error loading KPI data:', error);
      } finally {
        setKpiLoading(false);
      }
    };
    
    if (selectedCampaign) {
      loadKpiData();
    }
  }, [selectedCampaign]);
  
  // Handle campaign change
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCampaign(e.target.value);
  };
  
  // Handle KPI data refresh
  const handleKpiAdded = useCallback(() => {
    if (selectedCampaign) {
      // Reload KPI data
      setKpiLoading(true);
      KpiService.getKpiByCampaignId(selectedCampaign).then((kpis) => {
        setKpiData(kpis);
        setKpiLoading(false);
      }).catch((error) => {
        console.error('Error reloading KPI data:', error);
        setKpiLoading(false);
      });
    }
  }, [selectedCampaign]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // Get currently selected campaign
  const currentCampaign = campaigns.find(c => c.id === selectedCampaign);
  
  // Get latest KPI data or empty data if none exists
  const latestKpi = filteredKpiData.length > 0 ? filteredKpiData[0] : null;
  
  // Icons for metrics
  const budgetIcon = (
    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center theme-transition">
      <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
  
  const impressionsIcon = (
    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center theme-transition">
      <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </div>
  );
  
  const clicksIcon = (
    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center theme-transition">
      <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    </div>
  );
  
  const reachIcon = (
    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center theme-transition">
      <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
  );
  
  // Loading state
  if (isLoading) {
    return <RobotLoader title="Building KPI Dashboard" subtitle="Our robots are analyzing your campaign data..." />;
  }
  
  // Error state
  if (profileError) {
    return (
      <div className="container mx-auto py-10 px-4">
        <ErrorDisplay 
          message={profileError}
          subMessage="We couldn't load your profile information. Please try again."
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 bg-app theme-transition">
      <DashboardHeader
        title="Campaign Analytics"
        userName={profile?.first_name || profile?.email.split('@')[0] || ''}
        onBack={() => router.push('/data')}
        backText="Back to Dashboard"
      />
      
      <div className="mb-6">
        <Card className="bg-card shadow-app theme-transition">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary">KPI Dashboard</h2>
                <p className="text-secondary mt-1">Track performance metrics and analyze campaign effectiveness</p>
              </div>
              
              <div className="w-full md:w-64">
                <label htmlFor="campaign-select" className="block text-sm font-medium text-secondary mb-1">Select Campaign</label>
                <select
                  id="campaign-select"
                  value={selectedCampaign || ''}
                  onChange={handleCampaignChange}
                  className="w-full rounded-md border-app bg-card text-primary py-2 px-3 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-200 focus:ring-opacity-50 theme-transition"
                  disabled={campaignsLoading || campaigns.length === 0}
                >
                  {campaignsLoading ? (
                    <option>Loading campaigns...</option>
                  ) : campaigns.length === 0 ? (
                    <option>No campaigns found</option>
                  ) : (
                    campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {selectedCampaign && currentCampaign ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-primary">
              {currentCampaign.name}
              <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {currentCampaign.status}
              </span>
            </h3>
            
            <div className="flex space-x-2 bg-card rounded-lg overflow-hidden shadow-app-sm p-1 border border-app theme-transition">
              <button 
                onClick={() => setActiveTimeframe('week')} 
                className={`px-3 py-1.5 text-sm font-medium rounded ${activeTimeframe === 'week' ? 'bg-primary-500 text-white' : 'text-secondary hover:bg-hover'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setActiveTimeframe('month')} 
                className={`px-3 py-1.5 text-sm font-medium rounded ${activeTimeframe === 'month' ? 'bg-primary-500 text-white' : 'text-secondary hover:bg-hover'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setActiveTimeframe('all')} 
                className={`px-3 py-1.5 text-sm font-medium rounded ${activeTimeframe === 'all' ? 'bg-primary-500 text-white' : 'text-secondary hover:bg-hover'}`}
              >
                All Time
              </button>
            </div>
          </div>
          
          {kpiLoading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner" />
            </div>
          ) : latestKpi ? (
            <>
              {/* KPI Summary Card */}
              <div className="mb-6">
                <KpiSummary kpiData={filteredKpiData} />
              </div>
            
              {/* KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col">
                  <KpiMetricCard
                    title="Budget"
                    metric={latestKpi.budget}
                    icon={budgetIcon}
                    pattern="dots"
                    color="blue"
                  />
                  {filteredKpiData.length > 1 && (
                    <Card className="mt-4 bg-card border border-app overflow-hidden">
                      <div className="px-5">
                        <KpiTrendChart data={filteredKpiData} metricKey="budget" />
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <KpiMetricCard
                    title="Impressions"
                    metric={latestKpi.impressions}
                    icon={impressionsIcon}
                    pattern="lines"
                    color="green"
                  />
                  {filteredKpiData.length > 1 && (
                    <Card className="mt-4 bg-card border border-app overflow-hidden">
                      <div className="px-5">
                        <KpiTrendChart data={filteredKpiData} metricKey="impressions" />
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <KpiMetricCard
                    title="Clicks"
                    metric={latestKpi.clicks}
                    icon={clicksIcon}
                    pattern="circles"
                    color="purple"
                  />
                  {filteredKpiData.length > 1 && (
                    <Card className="mt-4 bg-card border border-app overflow-hidden">
                      <div className="px-5">
                        <KpiTrendChart data={filteredKpiData} metricKey="clicks" />
                      </div>
                    </Card>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <KpiMetricCard
                    title="Reach"
                    metric={latestKpi.reach}
                    icon={reachIcon}
                    pattern="waves"
                    color="orange"
                  />
                  {filteredKpiData.length > 1 && (
                    <Card className="mt-4 bg-card border border-app overflow-hidden">
                      <div className="px-5">
                        <KpiTrendChart data={filteredKpiData} metricKey="reach" />
                      </div>
                    </Card>
                  )}
                </div>
              </div>
              
              {/* KPI Data Management */}
              <Card className="bg-card shadow-app-sm border border-app mb-8 theme-transition">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Add KPI Data</h3>
                  <p className="text-secondary mb-6">
                    Track your campaign performance by adding KPI data regularly.
                    This helps you monitor progress and make data-driven decisions.
                  </p>
                  <AddKpiForm
                    campaignId={selectedCampaign}
                    onKpiAdded={handleKpiAdded}
                  />
                </div>
              </Card>
            </>
          ) : (
            <Card className="bg-card shadow-app-sm border border-app p-8 theme-transition">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">No KPI Data Available</h3>
                <p className="text-secondary mb-6 max-w-md mx-auto">
                  Start tracking your campaign performance by adding your first KPI data entry.
                </p>
                <AddKpiForm
                  campaignId={selectedCampaign}
                  onKpiAdded={handleKpiAdded}
                />
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-card shadow-app-sm border border-app p-8 text-center theme-transition">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">No Campaigns Found</h3>
          <p className="text-secondary mb-6">
            You need to create at least one campaign before you can track KPI data.
          </p>
          <button
            onClick={() => router.push('/data')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Return to Dashboard
          </button>
        </Card>
      )}
    </div>
  );
} 