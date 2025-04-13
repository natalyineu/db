"use client";

import { useState, useEffect, useCallback } from 'react';
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

export default function KpiDashboard() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile(3);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<CampaignKPI[]>([]);
  const [kpiLoading, setKpiLoading] = useState(false);
  const router = useRouter();

  // Combined loading state
  const isLoading = authLoading || profileLoading;
  
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
  const latestKpi = kpiData.length > 0 ? kpiData[0] : null;
  
  // Icons for metrics
  const budgetIcon = (
    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
  
  const impressionsIcon = (
    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </div>
  );
  
  const clicksIcon = (
    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    </div>
  );
  
  const reachIcon = (
    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-orange-100 flex items-center justify-center">
      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="container mx-auto py-10 px-4">
      <DashboardHeader
        title="Campaign KPIs"
        userName={profile?.first_name || profile?.email.split('@')[0] || ''}
        onBack={() => router.push('/data')}
        backText="Back to Dashboard"
      />
      
      <div className="mb-6">
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Campaign Performance</h2>
            
            <div className="w-full sm:w-64">
              <label htmlFor="campaign-select" className="sr-only">Select Campaign</label>
              <select
                id="campaign-select"
                value={selectedCampaign || ''}
                onChange={handleCampaignChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        </Card>
      </div>
      
      {selectedCampaign && currentCampaign ? (
        <>
          {kpiLoading ? (
            <div className="flex justify-center py-12">
              <div className="loading-spinner" />
            </div>
          ) : latestKpi ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">KPI Dashboard for {currentCampaign.name}</h3>
                <p className="text-sm text-gray-500">
                  Latest data from {new Date(latestKpi.date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiMetricCard
                  title="Budget"
                  metric={latestKpi.budget}
                  icon={budgetIcon}
                  pattern="dots"
                  color="blue"
                />
                
                <KpiMetricCard
                  title="Impressions"
                  metric={latestKpi.impressions}
                  icon={impressionsIcon}
                  pattern="lines"
                  color="green"
                />
                
                <KpiMetricCard
                  title="Clicks"
                  metric={latestKpi.clicks}
                  icon={clicksIcon}
                  pattern="circles"
                  color="purple"
                />
                
                <KpiMetricCard
                  title="Reach"
                  metric={latestKpi.reach}
                  icon={reachIcon}
                  pattern="waves"
                  color="orange"
                />
              </div>
              
              {/* KPI History */}
              <div className="mb-6">
                <Card>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">KPI History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Budget
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Impressions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clicks
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reach
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {kpiData.map((kpi) => (
                          <tr key={kpi.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(kpi.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="font-medium">{kpi.budget.fact.toLocaleString()}</span>
                                <span className="ml-2 text-xs text-gray-400">/{kpi.budget.plan.toLocaleString()}</span>
                                <span className={`ml-2 text-xs font-medium ${kpi.budget.percentage >= 90 ? 'text-green-600' : kpi.budget.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {kpi.budget.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="font-medium">{kpi.impressions.fact.toLocaleString()}</span>
                                <span className="ml-2 text-xs text-gray-400">/{kpi.impressions.plan.toLocaleString()}</span>
                                <span className={`ml-2 text-xs font-medium ${kpi.impressions.percentage >= 90 ? 'text-green-600' : kpi.impressions.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {kpi.impressions.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="font-medium">{kpi.clicks.fact.toLocaleString()}</span>
                                <span className="ml-2 text-xs text-gray-400">/{kpi.clicks.plan.toLocaleString()}</span>
                                <span className={`ml-2 text-xs font-medium ${kpi.clicks.percentage >= 90 ? 'text-green-600' : kpi.clicks.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {kpi.clicks.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <span className="font-medium">{kpi.reach.fact.toLocaleString()}</span>
                                <span className="ml-2 text-xs text-gray-400">/{kpi.reach.plan.toLocaleString()}</span>
                                <span className={`ml-2 text-xs font-medium ${kpi.reach.percentage >= 90 ? 'text-green-600' : kpi.reach.percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {kpi.reach.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No KPI Data Available</h3>
              <p className="text-gray-500 mb-6">There is no KPI data for this campaign yet. Add some data to get started.</p>
            </div>
          )}
          
          <AddKpiForm campaignId={selectedCampaign} onKpiAdded={handleKpiAdded} />
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Selected</h3>
          <p className="text-gray-500 mb-6">Please select a campaign to view its KPI data.</p>
        </div>
      )}
    </div>
  );
} 