'use client';

import { useState, useCallback } from 'react';
import { Brief } from '@/types';
import BriefItem from './BriefItem';
import Pagination from './Pagination';
import SortControls from './SortControls';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * This component replaces the previous CampaignList component.
 */

interface BriefListProps {
  briefs: Brief[] | null;
  isLoading: boolean;
  onRefreshNeeded?: () => void;
  showEditButton?: boolean;
  onSelect?: (brief: Brief) => void;
  onDelete?: (briefId: string) => Promise<void>;
  onView?: (briefId: string) => void;
  
  // Pagination and sorting (if provided externally)
  page?: number;
  totalPages?: number;
  sortField?: keyof Brief;
  sortDirection?: 'asc' | 'desc';
  handleSortChange?: (field: keyof Brief) => void;
  handlePageChange?: (page: number) => void;
  paginatedBriefs?: Brief[];
}

const BriefList = ({ 
  briefs, 
  isLoading, 
  onRefreshNeeded,
  showEditButton = false,
  onSelect,
  onDelete,
  onView,
  // Optional pagination/sorting from parent
  page: externalPage,
  totalPages: externalTotalPages,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  handleSortChange: externalHandleSortChange,
  handlePageChange: externalHandlePageChange,
  paginatedBriefs: externalPaginatedBriefs
}: BriefListProps) => {
  // Local state for filtering
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Use either external pagination/sorting or fallback to simple display
  const displayBriefs = externalPaginatedBriefs || briefs || [];
  
  // Handle brief update (used by child components)
  const handleBriefUpdate = useCallback(() => {
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
  }, [onRefreshNeeded]);

  // Handle delete actions
  const handleDeleteClick = useCallback((briefId: string) => {
    setDeleteConfirmId(briefId);
  }, []);

  const handleDeleteConfirm = useCallback(async (briefId: string) => {
    if (onDelete) {
      await onDelete(briefId);
      setDeleteConfirmId(null);
    }
  }, [onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 theme-transition">
        {[...Array(3)].map((_, index) => (
          <div key={`skeleton-${index}`} className="bg-card shadow-app-sm border-app rounded-lg p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-hover dark:bg-dark-hover rounded-full"></div>
              <div className="flex-1">
                <div className="w-1/3 h-5 bg-hover dark:bg-dark-hover rounded mb-2"></div>
                <div className="w-1/4 h-4 bg-hover dark:bg-dark-hover rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-hover dark:bg-dark-hover rounded"></div>
              </div>
              <div className="w-20 h-6 bg-hover dark:bg-dark-hover rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!briefs || briefs.length === 0) {
    return (
      <div className="bg-card shadow-app-sm border-app rounded-lg p-8 text-center theme-transition">
        <svg 
          className="mx-auto h-12 w-12 text-secondary" 
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
        <h3 className="mt-2 text-sm font-medium text-primary">No briefs</h3>
        <p className="mt-1 text-sm text-secondary">
          Get started by creating your first brief.
        </p>
        {onSelect && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onSelect({} as Brief)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Brief
            </button>
          </div>
        )}
      </div>
    );
  }
  
  // Filter briefs by status if a filter is selected
  const filteredBriefs = selectedStatus 
    ? displayBriefs.filter(brief => brief.status === selectedStatus)
    : displayBriefs;
  
  return (
    <div className="space-y-4 theme-transition">
      {externalSortField && externalHandleSortChange && (
        <SortControls 
          totalItems={briefs.length}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortField={externalSortField}
          sortDirection={externalSortDirection || 'desc'}
          handleSortChange={externalHandleSortChange}
        />
      )}
      
      <div className="space-y-4">
        {filteredBriefs.map(brief => (
          <BriefItem 
            key={brief.id} 
            brief={brief} 
            onUpdate={handleBriefUpdate}
            showEditButton={showEditButton}
            onEdit={onSelect}
            onDelete={onDelete ? handleDeleteClick : undefined}
            onView={onView}
            isDeleting={deleteConfirmId === brief.id}
            onDeleteConfirm={handleDeleteConfirm}
            onDeleteCancel={handleDeleteCancel}
          />
        ))}
      </div>
      
      {externalPage !== undefined && externalTotalPages !== undefined && externalHandlePageChange && (
        <Pagination
          page={externalPage}
          totalPages={externalTotalPages}
          totalItems={briefs.length}
          handlePageChange={externalHandlePageChange}
        />
      )}
    </div>
  );
};

export default BriefList; 