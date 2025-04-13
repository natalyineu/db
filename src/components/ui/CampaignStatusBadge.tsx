import { memo } from 'react';
import { CampaignStatus } from '@/types';

// Display status badge with appropriate color and better contrast
const CampaignStatusBadge = memo(({ status }: { status: CampaignStatus }) => {
  const statusStyles = {
    active: 'bg-[#D3E5D7] text-[#137333] border-[#CEEAD6]',
    paused: 'bg-[#FEF7E0] text-[#B06000] border-[#FDE293]',
    completed: 'bg-[#E8F0FE] text-[#1967D2] border-[#AECBFA]',
    draft: 'bg-[#F1F3F4] text-[#3C4043] border-[#DADCE0]'
  };

  const statusIcons = {
    active: (
      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    paused: (
      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    completed: (
      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    draft: (
      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.draft}`}>
      {statusIcons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});
CampaignStatusBadge.displayName = 'CampaignStatusBadge';

export default CampaignStatusBadge; 