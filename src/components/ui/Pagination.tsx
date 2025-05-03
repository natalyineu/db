import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  handlePageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, totalItems, handlePageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;
  
  // Create array of page numbers to display - uses more adaptive approach from PaginationControls
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if we have less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages to show
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);
      
      // Adjust if we're showing less than 3 middle pages
      if (endPage - startPage < 2) {
        if (page <= 3) {
          endPage = Math.min(4, totalPages - 1);
        } else {
          startPage = Math.max(2, totalPages - 3);
        }
      }
      
      // Add separator if needed
      if (startPage > 2) {
        pages.push(-1); // Use -1 to indicate separator
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add separator if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // Use -2 to indicate separator
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
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
        {totalItems && (
          <div>
            <p className="text-sm text-secondary">
              Showing <span className="font-medium">{Math.min((page - 1) * 10 + 1, totalItems)}</span> to{' '}
              <span className="font-medium">{Math.min(page * 10, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
        )}
        
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
            
            {/* Page buttons - using the improved algorithm */}
            {getPageNumbers().map((pageNum, index) => (
              pageNum < 0 ? (
                <span 
                  key={`separator-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-app bg-card text-sm font-medium text-secondary"
                >
                  ...
                </span>
              ) : (
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
              )
            ))}
            
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