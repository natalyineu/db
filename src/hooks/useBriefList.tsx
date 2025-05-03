import { useState, useMemo } from 'react';
import { Brief } from '@/types';

interface UseBriefListParams {
  briefs: Brief[] | null;
  defaultSortField?: keyof Brief;
  defaultSortDirection?: 'asc' | 'desc';
  defaultItemsPerPage?: number;
  onDelete?: (briefId: string) => Promise<void>;
}

interface UseBriefListResult {
  page: number;
  itemsPerPage: number;
  sortField: keyof Brief;
  sortDirection: 'asc' | 'desc';
  totalPages: number;
  paginatedBriefs: Brief[];
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  handleSortChange: (field: keyof Brief) => void;
  handlePageChange: (newPage: number) => void;
  // Additional properties for delete functionality
  deleteConfirm?: string | null;
  handleDeleteClick?: (briefId: string) => void;
  handleDeleteConfirm?: (briefId: string) => Promise<void>;
  handleDeleteCancel?: () => void;
}

/**
 * Custom hook for managing brief list pagination, sorting, and deletion
 */
export function useBriefList({
  briefs,
  defaultSortField = 'created_at',
  defaultSortDirection = 'desc',
  defaultItemsPerPage = 10,
  onDelete
}: UseBriefListParams): UseBriefListResult {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortField, setSortField] = useState<keyof Brief>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  
  // Delete confirmation state (only used if onDelete is provided)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sort and paginate briefs
  const paginatedBriefs = useMemo(() => {
    if (!briefs || briefs.length === 0) return [];
    
    // Sort
    const sortedBriefs = [...briefs].sort((a, b) => {
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
    return sortedBriefs.slice(start, end);
  }, [briefs, page, itemsPerPage, sortField, sortDirection]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return briefs ? Math.ceil(briefs.length / itemsPerPage) : 0;
  }, [briefs, itemsPerPage]);

  // Handle sort change
  const handleSortChange = (field: keyof Brief) => {
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

  // Delete handlers - only include if onDelete is provided
  let deleteHandlers = {};
  
  if (onDelete) {
    const handleDeleteClick = (briefId: string) => {
      setDeleteConfirm(briefId);
    };

    const handleDeleteConfirm = async (briefId: string) => {
      await onDelete(briefId);
      setDeleteConfirm(null);
    };

    const handleDeleteCancel = () => {
      setDeleteConfirm(null);
    };
    
    deleteHandlers = {
      deleteConfirm,
      handleDeleteClick,
      handleDeleteConfirm,
      handleDeleteCancel
    };
  }

  return {
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
    ...deleteHandlers
  };
}

export default useBriefList; 