import { BriefStatus } from '@/types';
import React, { memo } from 'react';

const BriefStatusBadge = memo(({ status }: { status: BriefStatus }) => {
  // Determine the appropriate color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format the status text for display
  const getStatusText = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const colorClasses = getStatusColor();
  const statusText = getStatusText();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      {statusText}
    </span>
  );
});

BriefStatusBadge.displayName = 'BriefStatusBadge';

export default BriefStatusBadge; 