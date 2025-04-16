import { UserProfile } from '@/types';

// Define fixed plans with their impression limits
const PLAN_LIMITS = {
  'Starter': 16500,
  'Growth': 46500,
  'Impact': 96500,
  'Tailored': 200000
};

// Helper function to get the next tier plan
const getNextTierPlan = (currentPlan: string): string => {
  if (currentPlan === 'Starter') return 'Growth';
  if (currentPlan === 'Growth') return 'Impact';
  if (currentPlan === 'Impact') return 'Tailored';
  return 'Tailored';
};

// Helper function to get next tier impressions
const getNextTierImpressions = (currentPlan: string): number => {
  const nextPlan = getNextTierPlan(currentPlan);
  return PLAN_LIMITS[nextPlan as keyof typeof PLAN_LIMITS];
};

interface UsageSectionProps {
  profile: UserProfile;
  impressions: number;
}

// Helper function to safely access profile.plan with proper type assertion
const getProfileWithPlan = (profile: UserProfile) => {
  const profileWithPlan = profile as UserProfile & { 
    plan?: { 
      impressions_limit: number;
      name?: string;
    } 
  };
  
  // If plan name exists but no impressions_limit, use predefined limit based on plan name
  if (profileWithPlan?.plan?.name && !profileWithPlan.plan.impressions_limit) {
    const planName = profileWithPlan.plan.name;
    profileWithPlan.plan.impressions_limit = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || 16500;
  }
  
  return profileWithPlan;
};

const UsageSection = ({ profile, impressions }: UsageSectionProps) => {
  const profileWithPlan = getProfileWithPlan(profile);
  const limit = profileWithPlan.plan?.impressions_limit || 16500;
  const impressionsUsage = Math.min(Math.round((impressions / limit) * 100), 100);
  const showUpgradeRecommendation = impressionsUsage > 70;
  const currentPlanName = profileWithPlan.plan?.name || 'Starter';
  const nextTierPlan = getNextTierPlan(currentPlanName);
  const nextTierImpressions = getNextTierImpressions(currentPlanName);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Impressions Usage</h2>
        <span className="text-sm text-gray-500">
          {impressions.toLocaleString()} / {limit.toLocaleString()} impressions
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className={`h-4 rounded-full ${
            impressionsUsage < 70 ? 'bg-green-500' :
            impressionsUsage < 90 ? 'bg-yellow-500' : 'bg-red-500'
          }`} 
          style={{ width: `${impressionsUsage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">0%</span>
        <span className="text-xs text-gray-500">100%</span>
      </div>
      
      {showUpgradeRecommendation && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-indigo-800">You&apos;re approaching your plan limit</h3>
              <p className="text-xs text-indigo-600 mt-1">
                You&apos;ve used {impressionsUsage}% of your current {currentPlanName} plan&apos;s impressions. 
                Consider upgrading to our {nextTierPlan} plan with {nextTierImpressions.toLocaleString()} impressions.
              </p>
              <div className="mt-2">
                <button className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageSection; 