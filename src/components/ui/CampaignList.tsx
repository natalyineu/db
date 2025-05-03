'use client';

import { useState, useCallback } from 'react';
import { Brief } from '@/types';
import CampaignItem from './CampaignItem';
import { useBriefList } from '@/hooks/useBriefList';
import Pagination from './Pagination';

/**
 * @deprecated Use BriefList component instead
 */
interface CampaignListProps {
  campaigns: Brief[] | null;
  isLoading?: boolean;
  showEditButton?: boolean;
  onSelect?: (campaign: Brief) => void;
  onDelete?: (campaignId: string) => Promise<void>;
  onView?: (campaignId: string) => void;
}

/**
 * @deprecated Use BriefList component instead
 */
const CampaignList = ({
  campaigns,
  isLoading = false,
  showEditButton = false,
  onSelect,
  onDelete,
  onView
}: CampaignListProps) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Use the useBriefList hook to handle pagination, sorting, etc.
  const {
    page,
    itemsPerPage,
    sortField,
    sortDirection,
    totalPages,
    paginatedBriefs,
    setPage,
    setItemsPerPage,
    handleSortChange,
    handlePageChange,
  } = useBriefList({
    briefs: campaigns,
    defaultSortField: 'created_at',
    defaultSortDirection: 'desc',
    defaultItemsPerPage: 5,
  });

  const handleCampaignUpdate = useCallback(() => {
    // Any update logic if needed
  }, []);

  const handleDeleteClick = useCallback((campaignId: string) => {
    setDeleteConfirmId(campaignId);
  }, []);

  const handleDeleteConfirm = useCallback(async (campaignId: string) => {
    if (onDelete) {
      await onDelete(campaignId);
    }
    setDeleteConfirmId(null);
  }, [onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No campaigns yet.</p>
        {onSelect && (
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => onSelect({} as Brief)}
          >
            Create Your First Campaign
          </button>
        )}
      </div>
    );
  }

  // Filter by status if needed
  const filteredCampaigns = paginatedBriefs;
  
  return (
    <div className="w-full">
      <div className="space-y-4">
        {filteredCampaigns.map(campaign => (
          <CampaignItem
            key={campaign.id}
            campaign={campaign}
            onUpdate={handleCampaignUpdate}
            showEditButton={showEditButton}
            onEdit={onSelect}
            onDelete={handleDeleteClick}
            onView={onView}
            isDeleting={deleteConfirmId === campaign.id}
            onDeleteConfirm={handleDeleteConfirm}
            onDeleteCancel={handleDeleteCancel}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination 
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CampaignList; 