import Link from 'next/link';
import { UserProfile } from '@/types';

// Define fixed plans with their impression limits
const PLAN_LIMITS = {
  'Starter': 16500,
  'Growth': 46500,
  'Impact': 96500,
  'Tailored': 200000
};

interface AccountInfoSectionProps {
  profile: UserProfile;
}

// Helper function to safely access profile.plan with proper type assertion
const getProfileWithPlan = (profile: UserProfile) => {
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

const AccountInfoSection = ({ profile }: AccountInfoSectionProps) => {
  const profileWithPlan = getProfileWithPlan(profile);
  
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