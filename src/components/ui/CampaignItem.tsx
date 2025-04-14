import { useState, memo, useCallback } from 'react';
import { Campaign } from '@/types';
import { formatDate } from '@/utils';
import CampaignStatusBadge from './CampaignStatusBadge';
import CampaignAssetItem from './CampaignAssetItem';
import AddCampaignAsset from './AddCampaignAsset';
import CampaignIcon from './CampaignIcon';

interface CampaignItemProps {
  campaign: Campaign;
  onUpdate: () => void;
  showEditButton?: boolean;
}

// Campaign item component - improved with Google Ads-inspired design
const CampaignItem = memo(({ campaign, onUpdate, showEditButton }: CampaignItemProps) => {
  const [showAssets, setShowAssets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const handleAssetAdded = useCallback(() => {
    setRefreshing(true);
    // Use requestAnimationFrame to prevent flickering
    requestAnimationFrame(() => {
      onUpdate();
      // Use a longer timeout to ensure the transition completes
      setTimeout(() => setRefreshing(false), 700);
    });
  }, [onUpdate]);
  
  const handleEdit = useCallback(() => {
    // This would typically open an edit modal or navigate to an edit page
    alert(`Edit campaign: ${campaign.name}`);
    // Implement actual edit functionality here
  }, [campaign.name]);
  
  // Get description from campaign object safely
  const description = (campaign as any).description;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#DADCE0] p-5 mb-5 transition-all duration-200 hover:shadow-md will-change-auto">
      <div className="flex items-start gap-4">
        <CampaignIcon name={campaign.name} />
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-[#3C4043]">{campaign.name}</h3>
              <div className="flex flex-wrap items-center text-sm text-[#5F6368] mt-1 gap-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Created: {formatDate(campaign.created_at)}
                </span>
                
                {campaign.start_date && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start: {formatDate(campaign.start_date)}
                  </span>
                )}
                
                {campaign.end_date && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    End: {formatDate(campaign.end_date)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CampaignStatusBadge status={campaign.status} />
              
              {showEditButton && (
                <button 
                  onClick={handleEdit}
                  className="p-1.5 rounded-full text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
                  aria-label="Edit campaign"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              <button 
                onClick={() => setShowAssets(!showAssets)}
                className="p-1.5 rounded-full text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
                aria-label={showAssets ? "Hide assets" : "Show assets"}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showAssets 
                    ? "M19 9l-7 7-7-7"  // Down arrow
                    : "M9 5l7 7-7 7"}   // Right arrow
                  />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Display description if available */}
          {description && (
            <p className="mt-2 text-sm text-[#5F6368] max-w-2xl">{description}</p>
          )}
          
          {/* Display existing assets and add new assets when expanded */}
          {showAssets && (
            <div className={`mt-4 transition-opacity duration-500 ease-out ${refreshing ? 'opacity-40' : 'opacity-100'} will-change-opacity`}>
              <h4 className="text-sm font-medium text-[#3C4043] mb-3">Campaign Assets:</h4>
              
              {campaign.assets && campaign.assets.length > 0 ? (
                <div className="space-y-2">
                  {campaign.assets.map((asset, index) => (
                    <CampaignAssetItem 
                      key={`asset-${campaign.id}-${index}`}
                      url={asset.url}
                      drive_link={asset.drive_link}
                      notes={asset.notes}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5F6368] italic mb-3">No assets added to this campaign yet.</p>
              )}
              
              <div className="mt-3">
                <AddCampaignAsset 
                  campaignId={campaign.id} 
                  onAssetAdded={handleAssetAdded} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
CampaignItem.displayName = 'CampaignItem';

export default CampaignItem; 