import { memo } from 'react';

interface CampaignAssetItemProps {
  url: string;
  drive_link?: string;
  notes?: string;
}

// Campaign asset item - improved with Google Ads-like styling
const CampaignAssetItem = memo(({ url, drive_link, notes }: CampaignAssetItemProps) => (
  <div className="border border-[#DADCE0] rounded-lg p-4 mb-3 bg-white hover:shadow-sm transition-all duration-200">
    <div className="flex flex-col space-y-3">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <span className="text-xs font-medium text-[#5F6368] uppercase tracking-wide">URL</span>
          <a 
            href={url.startsWith('http') ? url : `https://${url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-[#1967D2] hover:underline text-sm mt-0.5 font-medium"
          >
            {url}
            <svg className="w-3 h-3 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      
      {drive_link && (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#E6F4EA] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#137333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <span className="text-xs font-medium text-[#5F6368] uppercase tracking-wide">Materials</span>
            <a 
              href={drive_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-[#137333] hover:underline text-sm mt-0.5 font-medium"
            >
              Google Drive Link
              <svg className="w-3 h-3 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
      
      {notes && (
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#B06000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <span className="text-xs font-medium text-[#5F6368] uppercase tracking-wide">Notes</span>
            <p className="text-sm text-[#3C4043] mt-1">{notes}</p>
          </div>
        </div>
      )}
    </div>
  </div>
));
CampaignAssetItem.displayName = 'CampaignAssetItem';

export default CampaignAssetItem; 