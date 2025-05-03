'use client';

import { useState } from 'react';
import { Brief, BriefStatus, BriefType } from '@/types';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * This component replaces the previous CampaignItem component.
 */

interface BriefItemProps {
  brief: Brief;
  onUpdate?: () => void;
  showEditButton?: boolean;
  onEdit?: (brief: Brief) => void;
  onDelete?: (briefId: string) => void;
  onView?: (briefId: string) => void;
  isDeleting?: boolean;
  onDeleteConfirm?: (briefId: string) => Promise<void>;
  onDeleteCancel?: () => void;
}

/**
 * Renders a single brief item in a list
 */
const BriefItem = ({
  brief,
  onUpdate,
  showEditButton = false,
  onEdit,
  onDelete,
  onView,
  isDeleting = false,
  onDeleteConfirm,
  onDeleteCancel
}: BriefItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format dates for display
  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  // Get status display information
  const getStatusInfo = (status: BriefStatus) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'paused':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' };
      case 'completed':
        return { color: 'bg-blue-100 text-blue-800', label: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Draft' };
    }
  };

  // Get the status display
  const statusInfo = getStatusInfo(brief.status);
  
  // Instead of using type, show goal
  const getGoalInfo = (goal: string) => {
    switch (goal) {
      case 'Awareness':
        return { icon: '👁️', label: 'Awareness' };
      case 'Consideration':
        return { icon: '🤔', label: 'Consideration' };
      case 'Conversions':
        return { icon: '💰', label: 'Conversions' };
      default:
        return { icon: '📝', label: goal };
    }
  };
  
  const goalInfo = getGoalInfo(brief.goal || 'Awareness');

  // Handle view action
  const handleView = () => {
    if (onView) {
      onView(brief.id);
    }
  };

  // Handle edit action
  const handleEdit = () => {
    if (onEdit) {
      onEdit(brief);
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (onDelete) {
      onDelete(brief.id);
    }
  };

  // Format metrics for display
  const formatMetric = (value?: number, prefix = '', suffix = '') => {
    if (value === undefined || value === null) return 'N/A';
    return `${prefix}${value.toLocaleString()}${suffix}`;
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-card border-app rounded-lg shadow-app-sm overflow-hidden theme-transition">
      {/* Main content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Type icon */}
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
              <span role="img" aria-label={goalInfo.label}>{goalInfo.icon}</span>
            </div>
            
            <div>
              {/* Brief name */}
              <h3 className="text-lg font-medium text-primary">
                {brief.name}
              </h3>
              
              {/* Brief dates */}
              <p className="mt-1 text-sm text-secondary">
                {formatDate(brief.start_date)} — {formatDate(brief.end_date)}
              </p>
              
              {/* Basic metrics */}
              {brief.budget > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary">
                  <span>Budget: {formatCurrency(brief.budget)}</span>
                  {brief.spent !== undefined && <span>Spent: {formatCurrency(brief.spent)}</span>}
                  {brief.impressions !== undefined && <span>Impressions: {formatMetric(brief.impressions)}</span>}
                </div>
              )}
            </div>
          </div>
          
          {/* Status badge */}
          <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </div>
        </div>
        
        {/* Additional information (expandable) */}
        {isExpanded && (
          <div className="mt-4 border-t border-app pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-primary mb-2">Performance</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">Impressions</p>
                    <p className="text-sm font-medium text-primary">{formatMetric(brief.impressions)}</p>
                  </div>
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">Clicks</p>
                    <p className="text-sm font-medium text-primary">{formatMetric(brief.clicks)}</p>
                  </div>
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">CTR</p>
                    <p className="text-sm font-medium text-primary">{formatMetric(brief.ctr, '', '%')}</p>
                  </div>
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">Conversions</p>
                    <p className="text-sm font-medium text-primary">{formatMetric(brief.conversions)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-primary mb-2">Budget</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">Total Budget</p>
                    <p className="text-sm font-medium text-primary">{formatCurrency(brief.budget)}</p>
                  </div>
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">Spent</p>
                    <p className="text-sm font-medium text-primary">{formatCurrency(brief.spent)}</p>
                  </div>
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">ROAS</p>
                    <p className="text-sm font-medium text-primary">{formatMetric(brief.roas, '', 'x')}</p>
                  </div>
                  <div className="bg-app-light p-2 rounded">
                    <p className="text-xs text-secondary">Performance Score</p>
                    <p className="text-sm font-medium text-primary">{formatMetric(brief.performance_score)}</p>
                  </div>
                </div>
              </div>
              
              {brief.description && (
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-primary mb-2">Description</h4>
                  <p className="text-sm text-secondary">{brief.description}</p>
                </div>
              )}
              
              {brief.target_audience && (
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-primary mb-2">Target Audience</h4>
                  <p className="text-sm text-secondary">{brief.target_audience}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-4 py-3 bg-app-light border-t border-app flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-secondary hover:text-primary"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
        
        <div className="flex space-x-2">
          {isDeleting ? (
            <>
              <span className="text-sm text-red-500 mr-2">Delete this brief?</span>
              <button
                type="button"
                onClick={() => onDeleteCancel?.()}
                className="px-2 py-1 text-xs text-secondary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDeleteConfirm?.(brief.id)}
                className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              {onView && (
                <button
                  type="button"
                  onClick={handleView}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
                >
                  View
                </button>
              )}
              
              {showEditButton && onEdit && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-primary bg-app-light hover:bg-hover focus:outline-none"
                >
                  Edit
                </button>
              )}
              
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-500 hover:text-red-700 focus:outline-none"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BriefItem; 