import { useState, useCallback } from 'react';
import { Campaign } from '@/types';
import CampaignItem from './CampaignItem';
import CampaignStatusBadge from './CampaignStatusBadge';
import { useCampaignList } from '@/hooks/useCampaignList';

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

  // Render pagination controls
  const renderPagination = () => {
    if (!campaigns || campaigns.length === 0 || totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
              ${page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <span className="relative z-0 inline-flex">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
              ${page >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min((page - 1) * 10 + 1, campaigns.length)}</span> to{' '}
              <span className="font-medium">{Math.min(page * 10, campaigns.length)}</span> of{' '}
              <span className="font-medium">{campaigns.length}</span> results
            </p>
          </div>
          
          <div>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page <= 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium
                  ${page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">First</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium
                  ${page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Logic to show pages around current page
                let pageNum = 1;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                      ${page === pageNum 
                        ? 'z-10 bg-[#E8F0FE] border-[#AECBFA] text-[#1967D2]' 
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium
                  ${page >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium
                  ${page >= totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Last</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };
  
  // Render sort controls
  const renderSortControls = () => {
    if (!campaigns || campaigns.length === 0) return null;
    
    return (
      <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-900">Campaigns</h2>
          <span className="bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs font-medium">
            {campaigns.length}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center space-x-4 mt-3 sm:mt-0">
          {/* Filter by status */}
          <div className="flex items-center">
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          {/* Sort controls */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-field" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort-field"
              className="block rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm"
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as keyof Campaign)}
            >
              <option value="name">Name</option>
              <option value="created_at">Date Created</option>
              <option value="status">Status</option>
              <option value="start_date">Start Date</option>
              <option value="end_date">End Date</option>
            </select>
            
            <button
              onClick={() => handleSortChange(sortField)}
              className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortDirection === 'asc' ? (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
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
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-0 rounded-lg overflow-hidden shadow-sm border border-gray-200">
      {/* Sort and filter controls */}
      {renderSortControls()}
      
      {/* Campaign list */}
      <div className="bg-gray-50 p-5 space-y-5">
        {paginatedCampaigns.map((campaign) => (
          <CampaignItem
            key={campaign.id}
            campaign={campaign}
            onUpdate={handleCampaignUpdate}
            showEditButton={showEditButton}
          />
        ))}
      </div>
      
      {/* Pagination controls */}
      {renderPagination()}
    </div>
  );
};

export default CampaignList; 