import React from 'react';

interface NextStepsCardProps {
  briefStatus: 'No' | 'In Progress' | 'Yes';
  paymentStatus: 'No' | 'In Progress' | 'Yes';
}

const NextStepsCard: React.FC<NextStepsCardProps> = ({ 
  briefStatus, 
  paymentStatus 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <h2 className="text-lg font-semibold">Next Steps</h2>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <span className="text-gray-500">Account created:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            briefStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            Yes
          </span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <span className="text-gray-500">Payment:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            paymentStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {paymentStatus === 'Yes' ? 'Completed' : 'Required'}
          </span>
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <span className="text-gray-500">Brief Sent:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            briefStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {briefStatus === 'Yes' ? 'Submitted' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NextStepsCard; 