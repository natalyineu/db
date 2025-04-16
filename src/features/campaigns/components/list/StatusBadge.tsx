import React from 'react';
import { CampaignStatus } from '@/types';

interface StatusBadgeProps {
  status: CampaignStatus;
}

/**
 * Status badge component for displaying campaign status
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClasses = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge; 