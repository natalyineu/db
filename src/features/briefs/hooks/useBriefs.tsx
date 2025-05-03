import { useState, useEffect, useCallback } from 'react';
import { BriefService } from '@/services/brief-service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Brief, BriefStatus } from '@/types';

interface CreateBriefInput {
  name: string;
  status?: BriefStatus;
  start_date?: string;
  end_date?: string;
}

interface BriefOperationResult {
  success: boolean;
  error?: string;
  brief?: Brief;
}

interface UpdateBriefInput {
  id: string;
  name?: string;
  status?: BriefStatus;
  start_date?: string;
  end_date?: string;
}

/**
 * Custom hook for managing briefs
 */
export function useBriefs() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
    if (user?.id) {
      fetchBriefs();
    } else {
      setBriefs([]);
      setSelectedBrief(null);
    }
  }, [user, fetchBriefs]);

  return {
    briefs,
    selectedBrief,
    isLoading,
    error,
    fetchBriefs,
    fetchBriefById,
    createBrief,
    updateBrief,
    deleteBrief,
    selectBrief,
  };
}

export default useBriefs; 