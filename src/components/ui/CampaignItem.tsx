import { useState, memo, useCallback } from 'react';
import { Campaign } from '@/types';
import { formatDate } from '@/utils';
import CampaignStatusBadge from './CampaignStatusBadge';
import CampaignAssetItem from './CampaignAssetItem';
import AddCampaignAsset from './AddCampaignAsset';

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
  
  // Campaign type icon based on name (just a simple mapping for variety)
  const getCampaignIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('social') || lowercaseName.includes('facebook') || lowercaseName.includes('instagram')) {
      return (
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#E8F0FE] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
      );
    } else if (lowercaseName.includes('email') || lowercaseName.includes('newsletter')) {
      return (
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#FEF7E0] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#B06000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else if (lowercaseName.includes('ads') || lowercaseName.includes('google') || lowercaseName.includes('display')) {
      return (
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#E6F4EA] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#137333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#F1F3F4] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
      );
    }
  };
  
  // Get description from campaign object safely
  const description = (campaign as any).description;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#DADCE0] p-5 mb-5 transition-all duration-200 hover:shadow-md will-change-auto">
      <div className="flex items-start gap-4">
        {getCampaignIcon(campaign.name)}
        
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