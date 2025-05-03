import React from 'react';
import { Brief } from '@/types';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * This component replaces the previous CampaignMetrics component.
 */

interface BriefMetricsProps {
  brief: Brief;
  className?: string;
}

const BriefMetrics: React.FC<BriefMetricsProps> = ({
  brief,
  className = '',
}) => {
  const formatNumber = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
      <div className="bg-card shadow-app-sm rounded-lg p-4 border-app theme-transition">
        <p className="text-xs font-medium text-secondary uppercase">Impressions</p>
        <p className="mt-1 text-2xl font-semibold text-primary">{formatNumber(brief.impressions)}</p>
      </div>
      <div className="bg-card shadow-app-sm rounded-lg p-4 border-app theme-transition">
        <p className="text-xs font-medium text-secondary uppercase">Clicks</p>
        <p className="mt-1 text-2xl font-semibold text-primary">{formatNumber(brief.clicks)}</p>
      </div>
      <div className="bg-card shadow-app-sm rounded-lg p-4 border-app theme-transition">
        <p className="text-xs font-medium text-secondary uppercase">Budget</p>
        <p className="mt-1 text-2xl font-semibold text-primary">{formatCurrency(brief.budget)}</p>
      </div>
      <div className="bg-card shadow-app-sm rounded-lg p-4 border-app theme-transition">
        <p className="text-xs font-medium text-secondary uppercase">ROAS</p>
        <p className="mt-1 text-2xl font-semibold text-primary">{brief.roas || 'N/A'}{brief.roas ? 'x' : ''}</p>
      </div>
    </div>
  );
};

export default BriefMetrics; 