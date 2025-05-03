'use client';

import React, { useState, useEffect } from 'react';
import { Brief } from '@/types';
import CampaignStatusBadge from './CampaignStatusBadge';
import CampaignIcon from './CampaignIcon';
import CampaignMetrics from './CampaignMetrics';
import AiInsightsSection from './AiInsightsSection';
import { mockPerformanceMetrics, mockAiRecommendations } from '@/utils/mock-data';

/**
 * Props for the CampaignItem component
 * @deprecated Use BriefItem component instead
 */
interface CampaignItemProps {
  campaign: Brief;
  onUpdate?: () => void;
  showEditButton?: boolean;
  // Additional props to support features implementation
  onEdit?: (campaign: Brief) => void;
  onDelete?: (campaignId: string) => void;
  onView?: (campaignId: string) => void;
  isDeleting?: boolean;
  onDeleteConfirm?: (campaignId: string) => Promise<void>;
  onDeleteCancel?: () => void;
}

/**
 * @deprecated Use BriefItem component instead
 * Campaign/Brief item card with a modern Google Ads-like UI
 */
const CampaignItem = ({
  campaign,
  onUpdate, 
  showEditButton = false,
  onEdit,
  onDelete,
  onView,
  isDeleting,
  onDeleteConfirm,
  onDeleteCancel
}: CampaignItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(75); // Start with stable value
  
  // Calculate performance score (0-100) on client-side only
  useEffect(() => {
    // This would typically be calculated based on real metrics
    const randomScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    setPerformanceScore(randomScore);
  }, [campaign.id]);
  
  // Format date strings for display
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get time ago text without using date-fns
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (onDelete) {
      onDelete(campaign.id);
    }
  };

  const handleConfirmDelete = async () => {
    if (onDeleteConfirm) {
      await onDeleteConfirm(campaign.id);
    }
  };

  const handleCancelDelete = () => {
    if (onDeleteCancel) {
      onDeleteCancel();
    }
  };

  // Handle edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(campaign);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    if (onView) {
      onView(campaign.id);
    }
  };
  
  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          {/* Icon and Title */}
          <div className="flex items-start space-x-3">
            <CampaignIcon type={campaign.type} className="w-10 h-10" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                {campaign.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Created {getTimeAgo(campaign.created_at)}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <CampaignStatusBadge status={campaign.status} />
        </div>
        
        {/* Campaign Metrics */}
        <CampaignMetrics
          budget={formatCurrency(campaign.budget)}
          spent={formatCurrency(campaign.spent)}
          impressions={campaign.impressions}
          clicks={campaign.clicks}
          conversions={campaign.conversions}
        />
        
        {/* Dates and Actions */}
        <div className="mt-4 flex items-end justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="font-medium">Start:</span>
              <span>{getFormattedDate(campaign.start_date)}</span>
              
              <span className="font-medium">End:</span>
              <span>{getFormattedDate(campaign.end_date)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {onView && (
              <button
                onClick={handleViewDetails}
                className="px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                View
              </button>
            )}
            
            {showEditButton && onEdit && (
              <button
                onClick={handleEdit}
                className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Edit
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Deletion Confirmation Modal */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex flex-col items-center justify-center p-4 z-10">
          <p className="text-sm text-gray-900 dark:text-white mb-3 text-center">
            Are you sure you want to delete this campaign?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCancelDelete}
              className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignItem; 