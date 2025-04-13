import { useState, useMemo } from 'react';

interface UseSortedPaginationOptions<T extends Record<string, any>> {
  items: T[];
  initialSortField?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
  initialItemsPerPage?: number;
}

interface UseSortedPaginationResult<T extends Record<string, any>> {
  paginatedItems: T[];
  page: number;
  totalPages: number;
  itemsPerPage: number;
  sortField: keyof T | string;
  sortDirection: 'asc' | 'desc';
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  handleSortChange: (field: keyof T) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

/**
 * Custom hook to handle sorting and pagination of array items
 */
export function useSortedPagination<T extends Record<string, any>>({
  items,
  initialSortField,
  initialSortDirection = 'desc',
  initialItemsPerPage = 10
}: UseSortedPaginationOptions<T>): UseSortedPaginationResult<T> {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Safely determine initial sort field, handling empty arrays
  const getInitialSortField = (): keyof T | string => {
    if (initialSortField) return initialSortField;
    if (items.length > 0) {
      return Object.keys(items[0])[0] as keyof T;
    }
    return 'id'; // Fallback to a common field name
  };
  
  const [sortField, setSortField] = useState<keyof T | string>(getInitialSortField());
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);

  // Sort and paginate items
  const paginatedItems = useMemo(() => {
    // Handle empty arrays
    if (items.length === 0) return [];
    
    // Sort
    const sortedItems = [...items].sort((a, b) => {
      // For date fields (assuming ISO strings)
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Handle date fields (check if it looks like an ISO date string)
      if (
        typeof aValue === 'string' && 
        typeof bValue === 'string' && 
        /\d{4}-\d{2}-\d{2}/.test(aValue) && 
        /\d{4}-\d{2}-\d{2}/.test(bValue)
      ) {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default comparison (convert to strings)
      const aString = String(aValue || '');
      const bString = String(bValue || '');
      
      return sortDirection === 'asc' 
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
    
    // Paginate
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedItems.slice(start, end);
  }, [items, page, itemsPerPage, sortField, sortDirection]);

  // Calculate total pages (safely handle empty arrays)
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Handle sort change
  const handleSortChange = (field: keyof T) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle page change with safety check
  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return {
    paginatedItems,
    page,
    totalPages,
    itemsPerPage,
    sortField,
    sortDirection,
    setPage: handlePageChange,
    setItemsPerPage,
    handleSortChange,
    setSortDirection
  };
} 