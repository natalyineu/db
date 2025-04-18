'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Campaign, CampaignStatus } from '@/types';
import Link from 'next/link';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  const supabase = createBrowserClient();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        const userRole = data.user?.app_metadata?.role;
        const isUserAdmin = userRole === 'admin';
        
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          router.push('/data');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }

    checkAdminStatus();
  }, [isAuthenticated, user, router, supabase]);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('campaigns')
          .select('*');
        
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setCampaigns(data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchCampaigns();
    }
  }, [isAdmin, statusFilter, supabase]);

  const handleUpdateStatus = async (campaignId: string, newStatus: CampaignStatus) => {
    try {
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaignId);
      
      if (error) throw error;
      
      // Update campaigns list
      setCampaigns(
        campaigns.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus, updated_at: new Date().toISOString() }
            : campaign
        )
      );
      
      setSuccess(`Campaign status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      setError('Failed to update campaign status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Not authorized. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Management</h1>
        <button
          onClick={() => router.push('/data')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-900 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-900 rounded-md">
          {success}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700"
        >
          <option value="all">All Campaigns</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">Loading campaigns...</td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">No campaigns found.</td>
              </tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {campaign.id.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {campaign.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : campaign.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${campaign.budget.toLocaleString()}
                    </div>
                    {campaign.spent && (
                      <div className="text-xs text-gray-500">
                        Spent: ${campaign.spent.toLocaleString()} ({Math.round((campaign.spent / campaign.budget) * 100)}%)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {campaign.impressions ? (
                      <div className="text-sm text-gray-900">
                        <div>{campaign.impressions.toLocaleString()} impressions</div>
                        {campaign.clicks && (
                          <div className="text-xs text-gray-500">
                            CTR: {((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No data</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateStatus(campaign.id, e.target.value as CampaignStatus);
                            e.target.value = "";
                          }
                        }}
                        className="text-sm border rounded-md px-2 py-1"
                      >
                        <option value="">Update Status</option>
                        <option value="draft" disabled={campaign.status === 'draft'}>Draft</option>
                        <option value="active" disabled={campaign.status === 'active'}>Active</option>
                        <option value="paused" disabled={campaign.status === 'paused'}>Paused</option>
                        <option value="completed" disabled={campaign.status === 'completed'}>Completed</option>
                      </select>
                      <Link
                        href={`/admin/campaigns/${campaign.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 