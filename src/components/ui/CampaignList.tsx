import { useState, memo } from 'react';
import { Campaign, CampaignStatus } from '@/types';
import { formatDate } from '@/utils';

type CampaignStatusBadgeProps = {
  status: CampaignStatus;
};

// Display status badge with appropriate color
const CampaignStatusBadge = memo(({ status }: CampaignStatusBadgeProps) => {
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
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
const CampaignItem = memo(({ campaign }: { campaign: Campaign }) => {
  const [showAssets, setShowAssets] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
          <p className="text-sm text-gray-500">Created: {formatDate(campaign.created_at)}</p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>
      
      <div className="mt-4">
        <button
          onClick={() => setShowAssets(!showAssets)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
        >
          {showAssets ? 'Hide Assets' : 'Show Assets'}
        </button>
      </div>
      
      {showAssets && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Campaign Assets</h4>
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
const CampaignList = ({ campaigns, isLoading }: { campaigns: Campaign[] | null; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={`skeleton-${i}`} className="bg-gray-100 rounded-lg h-32 w-full"></div>
        ))}
      </div>
    );
  }
  
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-600 font-medium">No campaigns available</p>
        <p className="text-gray-500 text-sm mt-2">Campaigns you create will appear here</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {campaigns.map(campaign => (
        <CampaignItem key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
};

export default CampaignList; 