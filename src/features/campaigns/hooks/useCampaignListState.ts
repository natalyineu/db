import { useState, useMemo } from 'react';
import { Campaign } from '@/types';

interface UseCampaignListStateProps {
  campaigns: Campaign[];
  onDelete: (campaignId: string) => Promise<void>;
}

interface UseCampaignListStateResult {
  page: number;
  itemsPerPage: number;
  sortField: keyof Campaign;
  sortDirection: 'asc' | 'desc';
  totalPages: number;
  paginatedCampaigns: Campaign[];
  deleteConfirm: string | null;
  handleSortChange: (field: keyof Campaign) => void;
  handlePageChange: (newPage: number) => void;
  handleDeleteClick: (campaignId: string) => void;
  handleDeleteConfirm: (campaignId: string) => Promise<void>;
  handleDeleteCancel: () => void;
}

/**
 * Custom hook for managing campaign list state including pagination, sorting and deletion
 */
export function useCampaignListState({
  campaigns,
  onDelete
}: UseCampaignListStateProps): UseCampaignListStateResult {
  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Campaign>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sort and paginate campaigns
  const paginatedCampaigns = useMemo(() => {
    // Sort
    const sortedCampaigns = [...campaigns].sort((a, b) => {
      // For date fields
      if (sortField === 'created_at' || sortField === 'updated_at' || sortField === 'start_date' || sortField === 'end_date') {
        const aDate = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
        const bDate = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // For string fields
      const aValue = String(a[sortField] || '');
      const bValue = String(b[sortField] || '');
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    
    // Paginate
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedCampaigns.slice(start, end);
  }, [campaigns, page, itemsPerPage, sortField, sortDirection]);

  // Calculate total pages
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);

  // Handle sort change
  const handleSortChange = (field: keyof Campaign) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Handle delete confirmation
  const handleDeleteClick = (campaignId: string) => {
    setDeleteConfirm(campaignId);
  };

  // Handle confirmed delete
  const handleDeleteConfirm = async (campaignId: string) => {
    await onDelete(campaignId);
    setDeleteConfirm(null);
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return {
    page,
    itemsPerPage,
    sortField,
    sortDirection,
    totalPages,
    paginatedCampaigns,
    deleteConfirm,
    handleSortChange,
    handlePageChange,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel
  };
} 