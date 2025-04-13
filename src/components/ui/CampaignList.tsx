import { useState, memo, useCallback } from 'react';
import { Campaign, CampaignStatus } from '@/types';
import { formatDate } from '@/utils';
import { AddCampaignAsset } from '@/components/ui';

// Display status badge with appropriate color
const CampaignStatusBadge = memo(({ status }: { status: CampaignStatus }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.draft}`}>
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
  <div className="border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
    <div className="flex flex-col space-y-2">
      <div>
        <span className="text-sm font-medium text-gray-500">URL:</span>
        <a 
          href={url.startsWith('http') ? url : `https://${url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 hover:underline"
        >
          {url}
        </a>
      </div>
      
      {drive_link && (
        <div>
          <span className="text-sm font-medium text-gray-500">Materials:</span>
          <a 
            href={drive_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline"
          >
            Google Drive Link
          </a>
        </div>
      )}
      
      {notes && (
        <div>
          <span className="text-sm font-medium text-gray-500">Notes:</span>
          <p className="text-sm text-gray-700 mt-1">{notes}</p>
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
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
          <p className="text-sm text-gray-500">Created: {formatDate(campaign.created_at)}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>
      
      <div className="mt-4 flex items-center">
        <button
          onClick={() => setShowAssets(!showAssets)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          {showAssets ? 'Hide Assets' : 'Show Assets'}
        </button>
        
        {refreshing && (
          <span className="ml-3 text-xs text-gray-500">Refreshing...</span>
        )}
      </div>
      
      {showAssets && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Campaign Assets</h4>
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
            <p className="text-sm text-gray-500">No assets available</p>
          )}
        </div>
      )}
    </div>
  );
});
CampaignItem.displayName = 'CampaignItem';

// Main campaign list component
const CampaignList = ({ campaigns, isLoading, onRefreshNeeded }: { 
  campaigns: Campaign[] | null; 
  isLoading: boolean;
  onRefreshNeeded?: () => void;
}) => {
  // Handle campaign updates
  const handleCampaignUpdate = useCallback(() => {
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
  }, [onRefreshNeeded]);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={`skeleton-${i}`} className="bg-gray-100 rounded-lg h-32 w-full"></div>
        ))}
      </div>
    );
  }
  
  // Empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex flex-col items-center">
          <svg className="h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-800 font-medium text-lg">No campaigns available</p>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Use the &ldquo;Create Campaign&rdquo; button above to start your first campaign
          </p>
        </div>
      </div>
    );
  }
  
  // List of campaigns
  return (
    <div className="space-y-4">
      {campaigns.map(campaign => (
        <CampaignItem 
          key={campaign.id}
          campaign={campaign} 
          onUpdate={handleCampaignUpdate} 
        />
      ))}
    </div>
  );
};

export default CampaignList; 