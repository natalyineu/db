import React from 'react';

// Define fixed plans with their impression limits
const PLAN_LIMITS = {
  'Starter': 16500,
  'Growth': 46500,
  'Impact': 96500,
  'Tailored': 200000,
  'Free': 1000
};

interface AccountInfoCardProps {
  profileEmail: string;
  createdAt: string;
  plan?: {
    name?: string;
    impressions_limit?: number;
  };
  impressionsUsed?: number;
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ 
  profileEmail, 
  createdAt, 
  plan,
  impressionsUsed = 0 
}) => {
  // Determine plan limit - use from profile or fallback to predefined
  const planName = plan?.name || 'Starter';
  const impressionLimit = plan?.impressions_limit || PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || 16500;
  
  // Calculate usage percentage
  const usagePercentage = Math.min(100, Math.round((impressionsUsed / impressionLimit) * 100)) || 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <h2 className="text-lg font-semibold">Account Information</h2>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Email:</span>
          <span className="font-medium">{profileEmail}</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Member since:</span>
          <span className="font-medium">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Plan:</span>
          <span className="font-medium">
            {planName} 
            <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
              {impressionLimit.toLocaleString()} impressions
            </span>
          </span>
        </div>
        
        <div>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-500">Impressions Used:</span>
            <span className="font-medium">
              {impressionsUsed.toLocaleString()} / {impressionLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                usagePercentage < 70 ? 'bg-green-500' :
                usagePercentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">{usagePercentage}% used</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoCard; 