import { useState, useCallback } from 'react';
import { Campaign } from '@/types';
import CampaignItem from './CampaignItem';
import { useCampaignList } from '@/hooks/useCampaignList';
import Pagination from './Pagination';
import SortControls from './SortControls';

interface CampaignListProps {
  campaigns: Campaign[] | null;
  isLoading: boolean;
  onRefreshNeeded?: () => void;
  showEditButton?: boolean;
}

const CampaignList = ({ 
  campaigns, 
  isLoading, 
  onRefreshNeeded, 
  showEditButton = false 
}: CampaignListProps) => {
  const {
    page,
    totalPages,
    paginatedCampaigns,
    sortField,
    sortDirection,
    handleSortChange,
    handlePageChange
  } = useCampaignList({
    campaigns,
    defaultSortField: 'created_at',
    defaultSortDirection: 'desc'
  });

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Handle campaign update (used by child components)
  const handleCampaignUpdate = useCallback(() => {
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
  }, [onRefreshNeeded]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="w-1/3 h-5 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            vectorEffect="non-scaling-stroke" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first campaign.
        </p>
      </div>
    );
  }
  
  // Filter campaigns by status if a filter is selected
  const filteredCampaigns = selectedStatus 
    ? paginatedCampaigns.filter(campaign => campaign.status === selectedStatus)
    : paginatedCampaigns;
  
  return (
    <div className="space-y-4">
      <SortControls 
        totalItems={campaigns.length}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSortChange={handleSortChange}
      />
      
      <div className="space-y-4">
        {filteredCampaigns.map(campaign => (
          <CampaignItem 
            key={campaign.id} 
            campaign={campaign} 
            onUpdate={handleCampaignUpdate}
            showEditButton={showEditButton}
          />
        ))}
      </div>
      
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={campaigns.length}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default CampaignList; 