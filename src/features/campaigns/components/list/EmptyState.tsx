import React from 'react';
import { Button } from '@/features/shared/ui/Button';

interface EmptyStateProps {
  onCreate: () => void;
}

/**
 * Empty state component for when there are no campaigns
 */
const EmptyState: React.FC<EmptyStateProps> = ({ onCreate }) => (
  <div className="text-center py-12">
    <svg 
      className="mx-auto h-12 w-12 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
    <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
    <div className="mt-6">
      <Button onClick={onCreate} size="sm">
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        New Campaign
      </Button>
    </div>
  </div>
);

export default EmptyState; 