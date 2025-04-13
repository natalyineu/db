import { MetricData } from '@/types';
import { memo } from 'react';

interface KpiMetricCardProps {
  title: string;
  metric: MetricData;
  icon: React.ReactNode;
  pattern: 'dots' | 'lines' | 'circles' | 'waves';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

// Function to format numbers with separators
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1
  }).format(num);
};

const KpiMetricCard = ({ title, metric, icon, pattern, color }: KpiMetricCardProps) => {
  // Determine status based on percentage
  const getStatusColor = (percentage: number): string => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Background patterns
  const getPatternClass = () => {
    switch (pattern) {
      case 'dots':
        return 'bg-dots-pattern';
      case 'lines':
        return 'bg-lines-pattern';
      case 'circles':
        return 'bg-circles-pattern';
      case 'waves':
        return 'bg-waves-pattern';
      default:
        return 'bg-dots-pattern';
    }
  };
  
  // Color schemes
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'purple':
        return 'bg-purple-50 border-purple-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  return (
    <div className={`rounded-lg p-5 border ${getColorClasses()} relative overflow-hidden`}>
      {/* Pattern background */}
      <div className={`absolute inset-0 opacity-5 ${getPatternClass()}`}></div>
      
      <div className="flex justify-between items-start">
        <div>
          <div className="text-gray-600 font-medium text-sm mb-1">{title}</div>
          <div className="text-2xl font-bold">{formatNumber(metric.fact)}</div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500">of {formatNumber(metric.plan)} planned</span>
          </div>
        </div>
        
        <div className="ml-4">
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-600" 
            style={{ width: `${Math.min(metric.percentage, 100)}%` }}
          ></div>
        </div>
        <div className={`text-sm font-semibold ${getStatusColor(metric.percentage)}`}>
          {metric.percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default memo(KpiMetricCard); 