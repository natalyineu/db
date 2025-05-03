'use client';

import React from 'react';

interface CampaignMetricsProps {
  budget: number;
  spent: number;
  roas?: number;
  formatCurrency: (value: number) => string;
}

const CampaignMetrics: React.FC<CampaignMetricsProps> = ({ 
  budget, 
  spent, 
  roas, 
  formatCurrency 
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[
        { label: 'Budget', value: formatCurrency(budget) },
        { label: 'Spent', value: formatCurrency(spent || 0) },
        { 
          label: 'ROAS', 
          value: roas ? `${roas.toFixed(1)}x` : 'N/A',
          highlight: roas && roas > 2
        }
      ].map((metric, index) => (
        <div key={index} className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className={`text-sm font-semibold ${metric.highlight ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CampaignMetrics; 