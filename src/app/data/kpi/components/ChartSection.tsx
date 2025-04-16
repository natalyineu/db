import React from 'react';
import { KpiData } from './types';

// Chart component without fake random data
const ChartSection = ({ kpiData }: { kpiData: KpiData[] }) => {
  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-gray-100 p-6 mb-8 transform transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-700">Performance Trends</h2>
        </div>
        
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Last 30 days</span>
        </div>
      </div>
      
      <div className="bg-purple-50 border border-dashed border-purple-200 rounded-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-purple-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-gray-700 font-medium mb-2">No trend data available yet</h3>
        <p className="text-gray-500">
          Trend data will appear here once your campaign has been running for some time.
          <br />
          Check back after your campaign has gathered more impressions and clicks.
        </p>
      </div>
      
      <div className="flex justify-center space-x-8 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Impressions</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Reach</span>
        </div>
      </div>
    </div>
  );
};

export default ChartSection; 