import React, { memo } from 'react';

interface BriefAssetItemProps {
  url: string;
  drive_link?: string;
  notes?: string;
}

/**
 * Brief asset item component - improved with Google Ads-like styling
 */
const BriefAssetItem = memo(({ url, drive_link, notes }: BriefAssetItemProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
    <div className="p-4 flex flex-col">
      {/* Preview Section */}
      <div className="mb-3 relative bg-gray-100 rounded overflow-hidden" style={{ minHeight: '120px' }}>
        {url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.gif') ? (
          <img 
            src={url} 
            alt="Asset preview" 
            className="w-full h-full object-contain"
            style={{ maxHeight: '200px' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x300?text=Preview+Not+Available';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full p-4 text-center">
            <span className="text-gray-500 text-sm">
              {url.includes('.pdf') 
                ? 'PDF Document'
                : url.includes('.doc') || url.includes('.docx')
                  ? 'Word Document'
                  : url.includes('.xls') || url.includes('.xlsx')
                    ? 'Excel Spreadsheet'
                    : 'External Link'}
            </span>
          </div>
        )}
      </div>
      
      {/* Asset Info */}
      <div className="flex-1 flex flex-col">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-800 truncate flex-1">
            {url.split('/').pop()?.split('?')[0] || 'Asset'}
          </h3>
        </div>
        
        {notes && (
          <div className="mt-1 mb-2">
            <p className="text-xs text-gray-600 line-clamp-2">{notes}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-auto pt-2 flex space-x-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex justify-center items-center px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
          >
            View
          </a>
          
          {drive_link && (
            <a
              href={drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center px-2 py-1 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-green-500"
            >
              Drive
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
));

BriefAssetItem.displayName = 'BriefAssetItem';

export default BriefAssetItem; 