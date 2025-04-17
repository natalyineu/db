import React from 'react';

interface NextStepsCardProps {
  briefStatus: 'No' | 'In Progress' | 'Yes';
  paymentStatus: 'No' | 'In Progress' | 'Yes';
  campaignStatus?: 'offline' | 'in progress' | 'online';
}

const NextStepsCard: React.FC<NextStepsCardProps> = ({ 
  briefStatus, 
  paymentStatus,
  campaignStatus = 'offline'
}) => {
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50/30 rounded-full translate-x-20 -translate-y-20"></div>
      <div className="absolute -bottom-10 right-32 w-20 h-20 bg-purple-50/30 rounded-full"></div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-dots-pattern opacity-5 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 sm:mb-5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="text-base sm:text-lg font-semibold ai-vertise-gradient-text">Next Steps</h2>
        </div>

        <div className="space-y-4 relative">
          <div className="absolute left-4 top-2 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-200 opacity-30"></div>
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 pl-8 relative">
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            </div>
            <span className="text-sm sm:text-base text-gray-600 font-medium">Account created:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              briefStatus === 'Yes' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              Yes
            </span>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 pl-8 relative">
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-pink-100 border-2 border-pink-200 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            </div>
            <span className="text-sm sm:text-base text-gray-600 font-medium">Payment:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              paymentStatus === 'Yes' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}>
              {paymentStatus === 'Yes' ? 'Completed' : 'Required'}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 pl-8 relative">
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            </div>
            <span className="text-sm sm:text-base text-gray-600 font-medium">Brief Sent:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              briefStatus === 'Yes' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
            }`}>
              {briefStatus === 'Yes' ? 'Submitted' : 'Pending'}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-2 pl-8 relative">
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            </div>
            <span className="text-sm sm:text-base text-gray-600 font-medium">Campaign status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              campaignStatus === 'online' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                : campaignStatus === 'in progress' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' 
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            }`}>
              {campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Call-to-action area */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Complete all steps to activate your campaign</p>
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                style={{ 
                  width: `${((briefStatus === 'Yes' ? 1 : 0) + (paymentStatus === 'Yes' ? 1 : 0) + 1) / 3 * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextStepsCard; 