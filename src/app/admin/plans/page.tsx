'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types/plans';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState<Omit<Plan, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    impressions_limit: 10000,
    description: '',
    price: 0,
    features: {}
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    async function fetchPlans() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });
        
        if (error) {
          console.error('Error fetching plans:', error);
          setError(`Failed to load plans: ${error.message}`);
          return;
        }
        
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchPlans();
    }
  }, [isAdmin, supabase]);

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isEditing: boolean
  ) => {
    const { name, value } = e.target;
    
    if (isEditing && editingPlan) {
      setEditingPlan({
        ...editingPlan,
        [name]: name === 'price' || name === 'impressions_limit' ? Number(value) : value
      });
    } else {
      setNewPlan({
        ...newPlan,
        [name]: name === 'price' || name === 'impressions_limit' ? Number(value) : value
      });
    }
  };

  const handleSavePlan = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      if (!editingPlan) return;
      
      const { id, created_at, updated_at, ...planData } = editingPlan;
      
      const { error } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh plans list
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      setPlans(data || []);
      setEditingPlan(null);
      setSuccess('Plan updated successfully');
    } catch (error) {
      console.error('Error updating plan:', error);
      setError('Failed to update plan');
    }
  };

  const handleCreatePlan = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      if (!newPlan.name || newPlan.impressions_limit <= 0) {
        setError('Plan name and impressions limit are required');
        return;
      }
      
      const { error } = await supabase
        .from('plans')
        .insert(newPlan);
      
      if (error) throw error;
      
      // Refresh plans list
      const { data, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      setPlans(data || []);
      setNewPlan({
        name: '',
        impressions_limit: 10000,
        description: '',
        price: 0,
        features: {}
      });
      setSuccess('Plan created successfully');
    } catch (error) {
      console.error('Error creating plan:', error);
      setError('Failed to create plan');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPlans(plans.filter(plan => plan.id !== id));
      setSuccess('Plan deleted successfully');
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Failed to delete plan');
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
        <h1 className="text-2xl font-bold">Subscription Plans Management</h1>
        <button
          onClick={() => router.push('/data')}
          className="px-4 py-2 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95"
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
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              name="name"
              value={newPlan.name}
              onChange={(e) => handleInputChange(e, false)}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., Premium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impressions Limit
            </label>
            <input
              type="number"
              name="impressions_limit"
              value={newPlan.impressions_limit}
              onChange={(e) => handleInputChange(e, false)}
              className="w-full p-2 border rounded-md"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={newPlan.price}
              onChange={(e) => handleInputChange(e, false)}
              className="w-full p-2 border rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={newPlan.description}
              onChange={(e) => handleInputChange(e, false)}
              className="w-full p-2 border rounded-md"
              placeholder="Brief plan description"
            />
          </div>
        </div>
        
        <button
          onClick={handleCreatePlan}
          className="px-4 py-2 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95"
        >
          Create Plan
        </button>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Existing Plans</h2>
      
      {loading ? (
        <div className="text-center p-4">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          No plans found. Create your first plan above.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white shadow-md rounded-lg p-6">
              {editingPlan?.id === plan.id ? (
                // Edit mode
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingPlan.name}
                        onChange={(e) => handleInputChange(e, true)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impressions Limit
                      </label>
                      <input
                        type="number"
                        name="impressions_limit"
                        value={editingPlan.impressions_limit}
                        onChange={(e) => handleInputChange(e, true)}
                        className="w-full p-2 border rounded-md"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editingPlan.price || 0}
                        onChange={(e) => handleInputChange(e, true)}
                        className="w-full p-2 border rounded-md"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={editingPlan.description || ''}
                        onChange={(e) => handleInputChange(e, true)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSavePlan}
                      className="px-4 py-2 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95"
                    >
                      Save Changes
                    </button>
                    
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div>${(plan.price || 0).toFixed(2)}</div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-700">{plan.description || 'No description available'}</p>
                    <p className="mt-2">
                      <span className="font-medium">Impressions:</span> {(plan.impressions_limit || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="px-3 py-1 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95 text-sm"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="px-3 py-1 ai-vertise-gradient-bg text-white rounded-md hover:opacity-95 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 