import React from 'react';
import { Campaign } from '@/types';
import { Button } from '@/features/shared/ui/Button';
import StatusBadge from './StatusBadge';

interface CampaignListItemProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onView: (campaignId: string) => void;
  isDeleting: boolean;
  onDeleteConfirm: (campaignId: string) => Promise<void>;
  onDeleteCancel: () => void;
}

/**
 * Campaign list item component that displays a single campaign in the list
 */
const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  onEdit,
  onDelete,
  onView,
  isDeleting,
  onDeleteConfirm,
  onDeleteCancel,
}) => {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <li key={campaign.id} className="block hover:bg-gray-50">
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
              onClick={() => onEdit(campaign)}
              className="mr-2"
            >
              Edit
            </Button>
            {isDeleting ? (
              <div className="flex space-x-2">
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDeleteConfirm(campaign.id)}
                  className="mr-2"
                >
                  Confirm
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onDeleteCancel}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(campaign.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <span className="mr-1.5 text-gray-400">Created:</span> {formatDate(campaign.created_at)}
            </p>
            {campaign.start_date && (
              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                <span className="mr-1.5 text-gray-400">Starts:</span> {formatDate(campaign.start_date)}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <p>
              <span className="mr-1.5 text-gray-400">Budget:</span>
              ${campaign.budget.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default CampaignListItem; 