import React from 'react';
import { Campaign } from '@/types';
import { Card } from '@/features/shared/ui/Card';
import {
  StatusBadge,
  EmptyState,
  SortControls,
  CampaignListItem,
  PaginationControls
} from './list';
import { useCampaignListState } from '../hooks/useCampaignListState';

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onSelect: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => Promise<void>;
  onView: (campaignId: string) => void;
}

/**
 * CampaignList component for displaying a list of campaigns
 */
export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  isLoading,
  onSelect,
  onDelete,
  onView,
}) => {
  // Use the custom hook to handle state and logic
  const {
    sortField,
    sortDirection,
    paginatedCampaigns,
    totalPages,
    page,
    deleteConfirm,
    handleSortChange,
    handlePageChange,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  } = useCampaignListState({ campaigns, onDelete });

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={`skeleton-${index}`} isLoading={true} className="h-32">
            <div />
          </Card>
        ))}
      </div>
    );
  }

  // If no campaigns, show empty state
  if (campaigns.length === 0) {
    return <EmptyState onCreate={() => onSelect({} as Campaign)} />;
  }

  return (
    <div>
      {/* Sorting controls */}
      <SortControls
        totalCount={campaigns.length}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onDirectionChange={() => handleSortChange(sortField)}
      />

      {/* Campaigns list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {paginatedCampaigns.map((campaign) => (
            <CampaignListItem
              key={campaign.id}
              campaign={campaign}
              onEdit={onSelect}
              onDelete={handleDeleteClick}
              onView={onView}
              isDeleting={deleteConfirm === campaign.id}
              onDeleteConfirm={handleDeleteConfirm}
              onDeleteCancel={handleDeleteCancel}
            />
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default CampaignList; 