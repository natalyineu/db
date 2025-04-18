'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types/plans';
import { UserProfile } from '@/types';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

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
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('impressions_limit', { ascending: true });
        
        if (plansError) throw plansError;
        
        // Fetch users with profiles
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*');
        
        if (usersError) throw usersError;
        
        setPlans(plansData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, supabase]);

  const handleUpdateUserPlan = async (userId: string) => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      // Find the selected plan
      const plan = plans.find(p => p.name === selectedPlan);
      if (!plan) {
        setError('Selected plan not found');
        return;
      }
      
      // Create plan object for the user
      const userPlan = {
        name: plan.name,
        impressions_limit: plan.impressions_limit,
        payment_status: 'active',
        renewal_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
      };
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({ plan: userPlan })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Refresh user list
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*');
      
      if (fetchError) throw fetchError;
      
      setUsers(data || []);
      setEditingUser(null);
      setSelectedPlan('');
      setSuccess('User plan updated successfully');
    } catch (error) {
      console.error('Error updating user plan:', error);
      setError('Failed to update user plan');
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="space-x-4">
          <Link
            href="/admin/plans"
            className="px-4 py-2 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95"
          >
            Manage Plans
          </Link>
          <button
            onClick={() => router.push('/data')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Plan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {user.plan?.name || 'No Plan'}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      {user.plan?.impressions_limit?.toLocaleString() || 0} impressions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.plan?.payment_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan?.payment_status || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingUser === user.id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="text-sm border rounded-md px-2 py-1"
                        >
                          <option value="">Select Plan</option>
                          {plans.map((plan) => (
                            <option key={plan.id} value={plan.name}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateUserPlan(user.id)}
                          className="ai-vertise-gradient-bg text-white text-xs px-2 py-1 rounded-md hover:opacity-95"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setSelectedPlan('');
                          }}
                          className="bg-gray-600 text-white text-xs px-2 py-1 rounded-md hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingUser(user.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Change Plan
                      </button>
                    )}
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