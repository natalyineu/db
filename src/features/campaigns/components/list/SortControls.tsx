import React from 'react';
import { Campaign } from '@/types';

interface SortControlsProps {
  totalCount: number;
  sortField: keyof Campaign;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: keyof Campaign) => void;
  onDirectionChange: () => void;
}

/**
 * Sort controls component for campaign list
 */
const SortControls: React.FC<SortControlsProps> = ({
  totalCount,
  sortField,
  sortDirection,
  onSortChange,
  onDirectionChange,
}) => {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200 sm:px-6 mb-4 rounded-t-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Campaigns</h3>
          <p className="mt-1 text-sm text-gray-500">
            A list of all your campaigns ({totalCount} total)
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
          <label htmlFor="sortField" className="text-sm font-medium text-gray-700 sr-only">
            Sort by
          </label>
          <select
            id="sortField"
            className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as keyof Campaign)}
          >
            <option value="name">Name</option>
            <option value="created_at">Created Date</option>
            <option value="status">Status</option>
            <option value="start_date">Start Date</option>
          </select>
          <button
            type="button"
            className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onDirectionChange}
            aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDirection === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortControls; 