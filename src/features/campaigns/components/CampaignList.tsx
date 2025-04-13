import React, { useState, useMemo } from 'react';
import { Campaign, CampaignStatus } from '@/types';
import { Card } from '@/features/shared/ui/Card';
import { Button } from '@/features/shared/ui/Button';

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onSelect: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => Promise<void>;
  onView: (campaignId: string) => void;
}

/**
 * Status badge component for displaying campaign status
 */
const StatusBadge: React.FC<{ status: CampaignStatus }> = ({ status }) => {
  const statusClasses = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * Empty state component for when there are no campaigns
 */
const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="text-center py-12">
    <svg 
      className="mx-auto h-12 w-12 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
    <div className="mt-6">
      <Button onClick={onCreate} size="sm">
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        New Campaign
      </Button>
    </div>
  </div>
);

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
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Campaign>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
      <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 mb-4 rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">
              A list of all your campaigns ({campaigns.length} total)
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
            <label htmlFor="sortField" className="text-sm font-medium text-gray-700 sr-only">
              Sort by
            </label>
            <select
              id="sortField"
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              value={sortField}
              onChange={(e) => handleSortChange(e.target.value as keyof Campaign)}
            >
              <option value="name">Name</option>
              <option value="created_at">Created Date</option>
              <option value="status">Status</option>
              <option value="start_date">Start Date</option>
            </select>
            <button
              type="button"
              className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortDirection === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {paginatedCampaigns.map((campaign) => (
            <li key={campaign.id}>
              <div className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">{campaign.name}</p>
                      <div className="ml-2 flex-shrink-0">
                        <StatusBadge status={campaign.status} />
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onView(campaign.id)}
                        className="mr-2"
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onSelect(campaign)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      {deleteConfirm === campaign.id ? (
                        <div className="flex space-x-2">
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteConfirm(campaign.id)}
                          >
                            Confirm
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDeleteCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteClick(campaign.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex sm:flex-col">
                      <p className="flex items-center text-sm text-gray-500">
                        <span>
                          {campaign.assets?.length || 0} assets
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <p>
                        Created{' '}
                        <time dateTime={campaign.created_at}>
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </time>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((page - 1) * itemsPerPage + 1, campaigns.length)}</span> to{' '}
                <span className="font-medium">{Math.min(page * itemsPerPage, campaigns.length)}</span> of{' '}
                <span className="font-medium">{campaigns.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList; 