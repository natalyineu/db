import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Brief, BriefStatus, BriefType } from '@/types';
import { BriefService } from '@/services/brief-service';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * This hook provides a unified API for working with briefs, including:
 * - CRUD operations
 * - Listing, filtering, sorting
 * - Pagination
 */

interface CreateBriefInput {
  name: string;
  status?: BriefStatus;
  type?: BriefType;
  start_date?: string;
  end_date?: string;
}

interface UpdateBriefInput {
  id: string;
  name?: string;
  status?: BriefStatus;
  type?: BriefType;
  start_date?: string;
  end_date?: string;
}

interface BriefOperationResult {
  success: boolean;
  error?: string;
  brief?: Brief;
}

interface UseBriefsOptions {
  /**
   * Enable auto-loading of briefs for the current user
   * @default true
   */
  autoLoad?: boolean;
  
  /**
   * Default sort field
   * @default 'created_at'
   */
  defaultSortField?: keyof Brief;
  
  /**
   * Default sort direction
   * @default 'desc'
   */
  defaultSortDirection?: 'asc' | 'desc';
  
  /**
   * Default items per page
   * @default 10
   */
  defaultItemsPerPage?: number;
}

/**
 * A unified hook for working with briefs, combining CRUD operations and list functionality
 */
export function useBriefs(options: UseBriefsOptions = {}) {
  const { 
    autoLoad = true,
    defaultSortField = 'created_at',
    defaultSortDirection = 'desc',
    defaultItemsPerPage = 10
  } = options;
  
  const { user } = useAuth();
  
  // Data state
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [sortField, setSortField] = useState<keyof Brief>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return briefs ? Math.ceil(briefs.length / itemsPerPage) : 0;
  }, [briefs, itemsPerPage]);
  
  // Handle sort change
  const handleSortChange = useCallback((field: keyof Brief) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);
  
  // Sort and paginate briefs
  const paginatedBriefs = useMemo(() => {
    if (!briefs || briefs.length === 0) return [];
    
    // Sort
    const sortedBriefs = [...briefs].sort((a, b) => {
      // For date fields
      if (sortField === 'created_at' || sortField === 'updated_at' || sortField === 'start_date' || sortField === 'end_date') {
        const aDate = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
        const bDate = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // For string fields
      const aValue = String(a[sortField] || '');
      const bValue = String(b[sortField] || '');
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    
    // Paginate
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedBriefs.slice(start, end);
  }, [briefs, page, itemsPerPage, sortField, sortDirection]);
  
  /**
   * Fetch all briefs for the current user
   */
  const fetchBriefs = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedBriefs = await BriefService.getBriefsByUserId(user.id);
      setBriefs(fetchedBriefs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch briefs');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Fetch a specific brief by ID
   */
  const fetchBriefById = useCallback(async (briefId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const brief = await BriefService.getBriefById(briefId);
      setSelectedBrief(brief);
      return brief;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch brief');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new brief
   */
  const createBrief = useCallback(async (input: CreateBriefInput): Promise<BriefOperationResult> => {
    if (!user?.id) {
      return { success: false, error: 'You must be logged in to create a brief' };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const brief = await BriefService.createBrief({
        name: input.name,
        status: input.status || 'draft',
        type: input.type,
        user_id: user.id,
        start_date: input.start_date,
        end_date: input.end_date,
      });
      
      if (!brief) {
        throw new Error('Failed to create brief');
      }
      
      // Update the local state with the new brief
      setBriefs((prevBriefs) => [brief, ...prevBriefs]);
      
      return { success: true, brief };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create brief';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Update an existing brief
   */
  const updateBrief = useCallback(async (input: UpdateBriefInput): Promise<BriefOperationResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updateData = {
        ...(input.name && { name: input.name }),
        ...(input.status && { status: input.status }),
        ...(input.type && { type: input.type }),
        ...(input.start_date && { start_date: input.start_date }),
        ...(input.end_date && { end_date: input.end_date }),
      };
      
      const updatedBrief = await BriefService.updateBrief(input.id, updateData);
      
      if (!updatedBrief) {
        throw new Error('Failed to update brief');
      }
      
      // Update the local state
      setBriefs((prevBriefs) => 
        prevBriefs.map((brief) => 
          brief.id === updatedBrief.id ? updatedBrief : brief
        )
      );
      
      // Update selected brief if it's the one being edited
      if (selectedBrief?.id === updatedBrief.id) {
        setSelectedBrief(updatedBrief);
      }
      
      return { success: true, brief: updatedBrief };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update brief';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [selectedBrief]);

  /**
   * Delete a brief
   */
  const deleteBrief = useCallback(async (briefId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await BriefService.deleteBrief(briefId);
      
      if (!success) {
        throw new Error('Failed to delete brief');
      }
      
      // Update the local state
      setBriefs((prevBriefs) => 
        prevBriefs.filter((brief) => brief.id !== briefId)
      );
      
      // Clear selected brief if it's the one being deleted
      if (selectedBrief?.id === briefId) {
        setSelectedBrief(null);
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete brief';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [selectedBrief]);

  /**
   * Set a brief as selected
   */
  const selectBrief = useCallback((briefId: string | null) => {
    if (!briefId) {
      setSelectedBrief(null);
      return;
    }
    
    const brief = briefs.find((b) => b.id === briefId) || null;
    setSelectedBrief(brief);
  }, [briefs]);

  // Load briefs on component mount or when user changes
  useEffect(() => {
    if (autoLoad && user?.id) {
      fetchBriefs();
    } else if (!user?.id) {
      setBriefs([]);
      setSelectedBrief(null);
    }
  }, [user, fetchBriefs, autoLoad]);

  return {
    // Basic data
    briefs,
    selectedBrief,
    isLoading,
    error,
    
    // CRUD operations
    fetchBriefs,
    fetchBriefById,
    createBrief,
    updateBrief,
    deleteBrief,
    selectBrief,
    
    // Pagination and sorting
    page,
    totalPages,
    itemsPerPage,
    setPage,
    setItemsPerPage,
    handlePageChange,
    
    // Sorting
    sortField,
    sortDirection,
    handleSortChange,
    
    // Processed data
    paginatedBriefs
  };
}

export default useBriefs; 