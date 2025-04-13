import { useState, useMemo } from 'react';
import { Campaign } from '@/types';

interface UseCampaignListParams {
  campaigns: Campaign[] | null;
  defaultSortField?: keyof Campaign;
  defaultSortDirection?: 'asc' | 'desc';
  defaultItemsPerPage?: number;
}

interface UseCampaignListResult {
  page: number;
  itemsPerPage: number;
  sortField: keyof Campaign;
  sortDirection: 'asc' | 'desc';
  totalPages: number;
  paginatedCampaigns: Campaign[];
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  handleSortChange: (field: keyof Campaign) => void;
  handlePageChange: (newPage: number) => void;
}

/**
 * Custom hook for managing campaign list pagination and sorting
 */
export function useCampaignList({
  campaigns,
  defaultSortField = 'created_at',
  defaultSortDirection = 'desc',
  defaultItemsPerPage = 10
}: UseCampaignListParams): UseCampaignListResult {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortField, setSortField] = useState<keyof Campaign>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  // Sort and paginate campaigns
  const paginatedCampaigns = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];
    
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
  const totalPages = useMemo(() => {
    return campaigns ? Math.ceil(campaigns.length / itemsPerPage) : 0;
  }, [campaigns, itemsPerPage]);

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

  return {
    page,
    itemsPerPage,
    sortField,
    sortDirection,
    totalPages,
    paginatedCampaigns,
    setPage,
    setItemsPerPage,
    handleSortChange,
    handlePageChange
  };
}

export default useCampaignList; 