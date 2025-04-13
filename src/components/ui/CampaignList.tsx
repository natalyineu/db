import { useState, memo, useCallback } from 'react';
import { Campaign, CampaignStatus } from '@/types';
import { formatDate } from '@/utils';
import { AddCampaignAsset } from '@/components/ui';
import { useSortedPagination } from '@/hooks/useSortedPagination';

// Display status badge with appropriate color
const CampaignStatusBadge = memo(({ status }: { status: CampaignStatus }) => {
  const statusStyles = {
    active: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200',
    paused: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200',
    draft: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    active: (
      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.draft}`}>
      {statusIcons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});
CampaignStatusBadge.displayName = 'CampaignStatusBadge';

// Campaign asset item
const CampaignAssetItem = memo(({ url, drive_link, notes }: { 
  url: string; 
  drive_link?: string; 
  notes?: string 
}) => (
  <div className="border border-gray-200 rounded-md p-3 mb-2 bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-all duration-200">
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="text-sm font-medium text-gray-500">URL:</span>
        <a 
          href={url.startsWith('http') ? url : `https://${url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 hover:underline flex items-center"
        >
          {url}
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      
      {drive_link && (
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-500">Materials:</span>
          <a 
            href={drive_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-green-600 hover:underline flex items-center"
          >
            Google Drive Link
            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
      
      {notes && (
        <div className="flex items-start">
          <svg className="w-4 h-4 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <div>
            <span className="text-sm font-medium text-gray-500">Notes:</span>
            <p className="text-sm text-gray-700 mt-1">{notes}</p>
          </div>
        </div>
      )}
    </div>
  </div>
));
CampaignAssetItem.displayName = 'CampaignAssetItem';

// Campaign item component
const CampaignItem = memo(({ campaign, onUpdate }: { campaign: Campaign; onUpdate: () => void }) => {
  const [showAssets, setShowAssets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleAssetAdded = useCallback(() => {
    setRefreshing(true);
    onUpdate();
    setTimeout(() => setRefreshing(false), 500);
  }, [onUpdate]);
  
  // Campaign type icon based on name (just a simple mapping for variety)
  const getCampaignIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('social') || lowercaseName.includes('facebook') || lowercaseName.includes('instagram')) {
      return (
        <div className="p-2 rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 text-blue-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
      );
    } else if (lowercaseName.includes('email') || lowercaseName.includes('newsletter')) {
      return (
        <div className="p-2 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (lowercaseName.includes('ads') || lowercaseName.includes('google') || lowercaseName.includes('display')) {
      return (
        <div className="p-2 rounded-full bg-gradient-to-br from-green-50 to-green-100 text-green-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
      );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        {getCampaignIcon(campaign.name)}
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Created: {formatDate(campaign.created_at)}
                
                {campaign.start_date && (
                  <span className="ml-3 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Started: {formatDate(campaign.start_date)}
                  </span>
                )}
              </div>
            </div>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          
          <div className="mt-4 flex items-center">
            <button
              onClick={() => setShowAssets(!showAssets)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none flex items-center bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
            >
              {showAssets ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Hide Assets
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Show Assets
                  {campaign.assets && campaign.assets.length > 0 && (
                    <span className="ml-1 bg-indigo-200 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">
                      {campaign.assets.length}
                    </span>
                  )}
                </>
              )}
            </button>
            
            {refreshing && (
              <span className="ml-3 text-xs text-gray-500 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            )}
          </div>
        </div>
      </div>
      
      {showAssets && (
        <div className="mt-5 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Campaign Assets
            </h4>
            <AddCampaignAsset campaignId={campaign.id} onAssetAdded={handleAssetAdded} />
          </div>
          
          {campaign.assets && campaign.assets.length > 0 ? (
            campaign.assets.map(asset => (
              <CampaignAssetItem 
                key={asset.id} 
                url={asset.url} 
                drive_link={asset.drive_link} 
                notes={asset.notes} 
              />
            ))
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No assets available. Add assets to help track your campaign materials.
            </div>
          )}
        </div>
      )}
    </div>
  );
});
CampaignItem.displayName = 'CampaignItem';

// Pagination component
const Pagination = memo(({ 
  page, 
  totalPages, 
  onPageChange 
}: { 
  page: number; 
  totalPages: number; 
  onPageChange: (page: number) => void 
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Create a window of pages centered around the current page
          let pageNum;
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
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-sm 
                ${page === pageNum 
                  ? 'bg-indigo-600 text-white font-medium' 
                  : 'text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
});
Pagination.displayName = 'Pagination';

// Main campaign list component
const CampaignList = ({ campaigns, isLoading, onRefreshNeeded }: { 
  campaigns: Campaign[] | null; 
  isLoading: boolean;
  onRefreshNeeded?: () => void;
}) => {
  // Use our custom pagination and sorting hook
  const {
    paginatedItems: paginatedCampaigns,
    page,
    totalPages,
    sortField,
    sortDirection,
    setPage,
    handleSortChange
  } = useSortedPagination<Campaign>({
    items: campaigns || [],
    initialSortField: 'created_at',
    initialSortDirection: 'desc',
    initialItemsPerPage: 5
  });
  
  // Handle campaign updates
  const handleCampaignUpdate = useCallback(() => {
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
  }, [onRefreshNeeded]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-32"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
                
                <div className="mt-4">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
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
        <div className="flex flex-col items-center">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-full mb-4">
            <svg className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-gray-800 font-medium text-xl mb-2">No campaigns yet</h3>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Create your first campaign to start optimizing your marketing efforts with AI-powered insights
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Campaign
          </button>
        </div>
      </div>
    );
  }
  
  // Sort controls
  const renderSortControls = () => {
    if (campaigns.length <= 1) return null;
    
    return (
      <div className="flex items-center mb-5 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <span className="text-gray-600 mr-3 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
          Sort:
        </span>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleSortChange('name')}
            className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors
              ${sortField === 'name' 
                ? 'bg-indigo-100 text-indigo-800 font-medium border border-indigo-200' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            Name
            {sortField === 'name' && (
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={sortDirection === 'asc' 
                    ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                    : "M16 17l-4 4m0 0l-4-4m4 4V3"} />
              </svg>
            )}
          </button>
          <button 
            onClick={() => handleSortChange('created_at')}
            className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors
              ${sortField === 'created_at' 
                ? 'bg-indigo-100 text-indigo-800 font-medium border border-indigo-200' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            Date
            {sortField === 'created_at' && (
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={sortDirection === 'asc' 
                    ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                    : "M16 17l-4 4m0 0l-4-4m4 4V3"} />
              </svg>
            )}
          </button>
          <button 
            onClick={() => handleSortChange('status')}
            className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors
              ${sortField === 'status' 
                ? 'bg-indigo-100 text-indigo-800 font-medium border border-indigo-200' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            Status
            {sortField === 'status' && (
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={sortDirection === 'asc' 
                    ? "M8 7l4-4m0 0l4 4m-4-4v18" 
                    : "M16 17l-4 4m0 0l-4-4m4 4V3"} />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  };
  
  // List of campaigns with pagination
  return (
    <div>
      {renderSortControls()}
      
      <div className="space-y-4">
        {paginatedCampaigns.map(campaign => (
          <CampaignItem 
            key={campaign.id}
            campaign={campaign} 
            onUpdate={handleCampaignUpdate} 
          />
        ))}
      </div>
      
      <Pagination 
        page={page} 
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default CampaignList; 