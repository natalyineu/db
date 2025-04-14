import React from 'react';
import { Campaign } from '@/types';

interface SortControlsProps {
  totalItems: number;
  selectedStatus: string | null;
  setSelectedStatus: (status: string | null) => void;
  sortField: keyof Campaign;
  sortDirection: 'asc' | 'desc';
  handleSortChange: (field: keyof Campaign) => void;
}

const SortControls = ({
  totalItems,
  selectedStatus,
  setSelectedStatus,
  sortField,
  sortDirection,
  handleSortChange
}: SortControlsProps) => {
  if (totalItems === 0) return null;
  
  return (
    <div className="bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg flex flex-wrap justify-between items-center">
      <div className="flex items-center space-x-2">
        <h2 className="text-lg font-medium text-gray-900">Campaigns</h2>
        <span className="bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs font-medium">
          {totalItems}
        </span>
      </div>
      
      <div className="flex flex-wrap items-center space-x-4 mt-3 sm:mt-0">
        {/* Filter by status */}
        <div className="flex items-center">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        {/* Sort controls */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-field" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort-field"
            value={sortField}
            onChange={(e) => handleSortChange(e.target.value as keyof Campaign)}
            className="block w-full rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 sm:text-sm"
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="created_at">Date Created</option>
            <option value="start_date">Start Date</option>
            <option value="end_date">End Date</option>
          </select>
          
          <button
            onClick={() => handleSortChange(sortField)}
            className="p-1.5 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50"
            aria-label={sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {sortDirection === 'asc' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortControls; 