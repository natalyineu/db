import React from 'react';
import Link from 'next/link';

const CampaignPerformanceCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <h2 className="text-lg font-semibold">Campaign Performance</h2>
        </div>
        
        <Link
          href="/data/kpi"
          className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 text-sm"
        >
          View Full Dashboard
        </Link>
      </div>
      
      <div className="text-center p-10 border border-dashed border-gray-200 rounded-lg bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-gray-500 font-medium mb-2">No campaign data yet</h3>
        <p className="text-gray-400 mb-4">Performance metrics will appear here once your campaign is live</p>
        <Link 
          href="/data/kpi"
          className="px-4 py-2 inline-flex bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          Set Up KPI Tracking
        </Link>
      </div>
    </div>
  );
};

export default CampaignPerformanceCard; 