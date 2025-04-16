import Link from 'next/link';
import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { createBrowserClient } from '@/lib/supabase';
import { Plan, DEFAULT_IMPRESSION_LIMIT } from '../types';

interface AccountInfoSectionProps {
  profile: UserProfile;
  plans?: Plan[];
}

// Helper function to safely access profile.plan with proper type assertion
const getProfileWithPlan = (profile: UserProfile, plans: Plan[]) => {
  const profileWithPlan = profile as UserProfile & { 
    plan?: { 
      impressions_limit: number;
      name?: string;
      payment_status?: string;
      renewal_date?: string;
    } 
  };
  
  // If plan name exists but no impressions_limit, look up from plans
  if (profileWithPlan?.plan?.name && !profileWithPlan.plan.impressions_limit && plans.length > 0) {
    const planName = profileWithPlan.plan.name;
    const planData = plans.find(p => p.name === planName);
    profileWithPlan.plan.impressions_limit = planData?.impressions_limit || DEFAULT_IMPRESSION_LIMIT;
  }
  
  return profileWithPlan;
};

const AccountInfoSection = ({ profile, plans: propPlans }: AccountInfoSectionProps) => {
  const [plans, setPlans] = useState<Plan[]>(propPlans || []);
  const supabase = createBrowserClient();
  
  // Fetch plans if not provided as props
  useEffect(() => {
    if (propPlans && propPlans.length > 0) {
      setPlans(propPlans);
      return;
    }
    
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('impressions_limit');
          
        if (error) {
          console.error('Error fetching plans:', error);
          return;
        }
        
        setPlans(data as Plan[]);
      } catch (error) {
        console.error('Error loading plans:', error);
      }
    }
    
    fetchPlans();
  }, [supabase, propPlans]);
  
  const profileWithPlan = getProfileWithPlan(profile, plans);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Plan Information */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Current Plan</h3>
          <div className="flex items-center">
            <p className="text-lg font-semibold">
              {profileWithPlan.plan?.name || 'Starter'}
            </p>
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              {profileWithPlan.plan?.impressions_limit?.toLocaleString()} impressions
            </span>
          </div>
          <div className="mt-2 flex space-x-2">
            <Link 
              href="/account/plans" 
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
            >
              View Plans
            </Link>
            {profileWithPlan.plan?.name !== 'Tailored' && (
              <button className="text-xs px-2 py-1 border border-indigo-300 rounded hover:bg-indigo-50 text-indigo-700">
                Upgrade
              </button>
            )}
          </div>
        </div>
        
        {/* Payment Status */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              profileWithPlan.plan?.payment_status === 'active' ? 'bg-green-500' :
              profileWithPlan.plan?.payment_status === 'past_due' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}></span>
            <p className="text-lg font-semibold">
              {profileWithPlan.plan?.payment_status === 'active' ? 'Active' :
              profileWithPlan.plan?.payment_status === 'past_due' ? 'Past Due' :
              profileWithPlan.plan?.payment_status === 'canceled' ? 'Canceled' : 'Not Available'}
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
        
        {/* Billing Date */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Next Billing Date</h3>
          <p className="text-lg font-semibold">
            {profileWithPlan.plan?.renewal_date 
              ? new Date(String(profileWithPlan.plan?.renewal_date)).toLocaleDateString() 
              : 'Not Available'
            }
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Your subscription will renew automatically
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoSection; 