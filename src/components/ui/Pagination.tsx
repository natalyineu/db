import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  handlePageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, totalItems, handlePageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-card border-t border-app rounded-b-lg theme-transition">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md theme-transition
            ${page <= 1 
              ? 'text-secondary opacity-50 cursor-not-allowed' 
              : 'text-primary bg-card hover:bg-hover'}`}
        >
          Previous
        </button>
        <span className="relative z-0 inline-flex text-secondary">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md theme-transition
            ${page >= totalPages 
              ? 'text-secondary opacity-50 cursor-not-allowed' 
              : 'text-primary bg-card hover:bg-hover'}`}
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-secondary">
            Showing <span className="font-medium">{Math.min((page - 1) * 10 + 1, totalItems)}</span> to{' '}
            <span className="font-medium">{Math.min(page * 10, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        
        <div>
          <nav className="inline-flex rounded-md shadow-app-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page <= 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-app text-sm font-medium theme-transition
                ${page <= 1 
                  ? 'bg-hover text-secondary cursor-not-allowed' 
                  : 'bg-card text-secondary hover:bg-hover'}`}
            >
              <span className="sr-only">First</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className={`relative inline-flex items-center px-2 py-2 border border-app text-sm font-medium theme-transition
                ${page <= 1 
                  ? 'bg-hover text-secondary cursor-not-allowed' 
                  : 'bg-card text-secondary hover:bg-hover'}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page buttons */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Logic to show pages around current page
              let pageNum = 1;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border border-app text-sm font-medium theme-transition
                    ${page === pageNum 
                      ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-300' 
                      : 'bg-card border-app text-primary hover:bg-hover'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className={`relative inline-flex items-center px-2 py-2 border border-app text-sm font-medium theme-transition
                ${page >= totalPages 
                  ? 'bg-hover text-secondary cursor-not-allowed' 
                  : 'bg-card text-secondary hover:bg-hover'}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={page >= totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-app text-sm font-medium theme-transition
                ${page >= totalPages 
                  ? 'bg-hover text-secondary cursor-not-allowed' 
                  : 'bg-card text-secondary hover:bg-hover'}`}
            >
              <span className="sr-only">Last</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 