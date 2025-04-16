import React from 'react';
import { LatestMetrics } from './types';

interface MetricsCardsProps {
  metrics: LatestMetrics;
  isLoading: boolean;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-28 bg-gray-100 rounded-lg p-4"></div>
        ))}
      </div>
    );
  }

  // Calculate percentages safely
  const calculatePercentage = (fact: number, plan: number) => {
    if (plan === 0) return 0;
    return Math.min(100, Math.round((fact / plan) * 100));
  };

  const impressionsPercentage = calculatePercentage(metrics.impressions, metrics.impressions_plan);
  const clicksPercentage = calculatePercentage(metrics.clicks, metrics.clicks_plan);
  const reachPercentage = calculatePercentage(metrics.reach, metrics.reach_plan);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Impressions Card */}
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-bold">Impressions</h3>
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full animate-pulse ${
            impressionsPercentage >= 90 ? 'bg-green-100 text-green-800' : 
            impressionsPercentage >= 50 ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {impressionsPercentage}% Achieved
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Plan:</span>
            <span className="font-bold text-gray-800">{metrics.impressions_plan.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Fact:</span>
            <span className="font-bold text-gray-800">{metrics.impressions.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 rounded-full bg-indigo-600 transition-all duration-1000 ease-out" 
              style={{ width: `${impressionsPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Clicks Card */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-bold">Clicks</h3>
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full animate-pulse ${
            clicksPercentage >= 90 ? 'bg-green-100 text-green-800' : 
            clicksPercentage >= 50 ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {clicksPercentage}% Achieved
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Plan:</span>
            <span className="font-bold text-gray-800">{metrics.clicks_plan.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Fact:</span>
            <span className="font-bold text-gray-800">{metrics.clicks.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 rounded-full bg-blue-600 transition-all duration-1000 ease-out" 
              style={{ width: `${clicksPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Reach Card */}
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-bold">Reach</h3>
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full animate-pulse ${
            reachPercentage >= 90 ? 'bg-green-100 text-green-800' : 
            reachPercentage >= 50 ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {reachPercentage}% Achieved
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Plan:</span>
            <span className="font-bold text-gray-800">{metrics.reach_plan.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Fact:</span>
            <span className="font-bold text-gray-800">{metrics.reach.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 rounded-full bg-green-600 transition-all duration-1000 ease-out" 
              style={{ width: `${reachPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards; 