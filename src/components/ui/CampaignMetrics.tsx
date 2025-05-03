'use client';

import React from 'react';

interface CampaignMetricsProps {
  budget: string;
  spent?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

const CampaignMetrics: React.FC<CampaignMetricsProps> = ({ 
  budget, 
  spent, 
  impressions,
  clicks,
  conversions
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 my-3">
      {[
        { label: 'Budget', value: budget },
        { label: 'Spent', value: spent || '-' },
        { 
          label: 'Impressions', 
          value: impressions ? impressions.toLocaleString() : '-'
        },
        {
          label: 'Clicks',
          value: clicks ? clicks.toLocaleString() : '-'
        },
        {
          label: 'Conversions',
          value: conversions ? conversions.toLocaleString() : '-'
        }
      ].slice(0, 3).map((metric, index) => (
        <div key={index} className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CampaignMetrics; 