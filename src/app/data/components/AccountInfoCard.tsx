import React from 'react';

interface AccountInfoCardProps {
  profileEmail: string;
  createdAt: string;
  plan?: {
    name?: string;
    impressions_limit?: number;
  } | string;
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ 
  profileEmail, 
  createdAt
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <h2 className="text-base sm:text-lg font-semibold">Account Information</h2>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-sm sm:text-base text-gray-500">Email:</span>
          <span className="text-sm sm:text-base font-medium">{profileEmail}</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-sm sm:text-base text-gray-500">Member since:</span>
          <span className="text-sm sm:text-base font-medium">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoCard; 