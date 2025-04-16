import React from 'react';
import { LatestMetrics } from './types';

interface MetricsCardsProps {
  metrics: LatestMetrics;
  isLoading: boolean;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Impressions Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Impressions</h3>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            impressionsPercentage >= 90 ? 'bg-green-100 text-green-800' : 
            impressionsPercentage >= 50 ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {impressionsPercentage}% Achieved
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Plan:</span>
            <span className="font-semibold">{metrics.impressions_plan.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Fact:</span>
            <span className="font-semibold">{metrics.impressions.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div 
              className="h-1.5 rounded-full bg-indigo-600" 
              style={{ width: `${impressionsPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Clicks Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Clicks</h3>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            clicksPercentage >= 90 ? 'bg-green-100 text-green-800' : 
            clicksPercentage >= 50 ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {clicksPercentage}% Achieved
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Plan:</span>
            <span className="font-semibold">{metrics.clicks_plan.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Fact:</span>
            <span className="font-semibold">{metrics.clicks.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div 
              className="h-1.5 rounded-full bg-indigo-600" 
              style={{ width: `${clicksPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Reach Card */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-600 font-medium text-sm">Reach</h3>
          <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            reachPercentage >= 90 ? 'bg-green-100 text-green-800' : 
            reachPercentage >= 50 ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {reachPercentage}% Achieved
          </div>
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Plan:</span>
            <span className="font-semibold">{metrics.reach_plan.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Fact:</span>
            <span className="font-semibold">{metrics.reach.toLocaleString()}</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div 
              className="h-1.5 rounded-full bg-indigo-600" 
              style={{ width: `${reachPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards; 