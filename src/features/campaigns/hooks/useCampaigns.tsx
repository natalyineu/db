import { useState, useEffect, useCallback } from 'react';
import { CampaignService } from '@/services/campaign-service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Campaign, CampaignStatus } from '@/types';

interface CreateCampaignInput {
  name: string;
  status?: CampaignStatus;
  start_date?: string;
  end_date?: string;
}

interface CampaignOperationResult {
  success: boolean;
  error?: string;
  campaign?: Campaign;
}

interface UpdateCampaignInput {
  id: string;
  name?: string;
  status?: CampaignStatus;
  start_date?: string;
  end_date?: string;
}

/**
 * Custom hook for managing campaigns
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Fetch all campaigns for the current user
   */
  const fetchCampaigns = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedCampaigns = await CampaignService.getCampaignsByUserId(user.id);
      setCampaigns(fetchedCampaigns);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Fetch a specific campaign by ID
   */
  const fetchCampaignById = useCallback(async (campaignId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const campaign = await CampaignService.getCampaignById(campaignId);
      setSelectedCampaign(campaign);
      return campaign;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaign');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new campaign
   */
  const createCampaign = useCallback(async (input: CreateCampaignInput): Promise<CampaignOperationResult> => {
    if (!user?.id) {
      return { success: false, error: 'You must be logged in to create a campaign' };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const campaign = await CampaignService.createCampaign({
        name: input.name,
        status: input.status || 'draft',
        user_id: user.id,
        start_date: input.start_date,
        end_date: input.end_date,
      });
      
      if (!campaign) {
        throw new Error('Failed to create campaign');
      }
      
      // Update the local state with the new campaign
      setCampaigns((prevCampaigns) => [campaign, ...prevCampaigns]);
      
      return { success: true, campaign };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create campaign';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Update an existing campaign
   */
  const updateCampaign = useCallback(async (input: UpdateCampaignInput): Promise<CampaignOperationResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updateData = {
        ...(input.name && { name: input.name }),
        ...(input.status && { status: input.status }),
        ...(input.start_date && { start_date: input.start_date }),
        ...(input.end_date && { end_date: input.end_date }),
      };
      
      const updatedCampaign = await CampaignService.updateCampaign(input.id, updateData);
      
      if (!updatedCampaign) {
        throw new Error('Failed to update campaign');
      }
      
      // Update the local state
      setCampaigns((prevCampaigns) => 
        prevCampaigns.map((campaign) => 
          campaign.id === updatedCampaign.id ? updatedCampaign : campaign
        )
      );
      
      // Update selected campaign if it's the one being edited
      if (selectedCampaign?.id === updatedCampaign.id) {
        setSelectedCampaign(updatedCampaign);
      }
      
      return { success: true, campaign: updatedCampaign };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update campaign';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaign]);

  /**
   * Delete a campaign
   */
  const deleteCampaign = useCallback(async (campaignId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await CampaignService.deleteCampaign(campaignId);
      
      if (!success) {
        throw new Error('Failed to delete campaign');
      }
      
      // Update the local state
      setCampaigns((prevCampaigns) => 
        prevCampaigns.filter((campaign) => campaign.id !== campaignId)
      );
      
      // Clear selected campaign if it's the one being deleted
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(null);
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete campaign';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaign]);

  /**
   * Set a campaign as selected
   */
  const selectCampaign = useCallback((campaignId: string | null) => {
    if (!campaignId) {
      setSelectedCampaign(null);
      return;
    }
    
    const campaign = campaigns.find((c) => c.id === campaignId) || null;
    setSelectedCampaign(campaign);
  }, [campaigns]);

  // Load campaigns on component mount or when user changes
  useEffect(() => {
    if (user?.id) {
      fetchCampaigns();
    } else {
      setCampaigns([]);
      setSelectedCampaign(null);
    }
  }, [user, fetchCampaigns]);

  return {
    campaigns,
    selectedCampaign,
    isLoading,
    error,
    fetchCampaigns,
    fetchCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    selectCampaign,
  };
}

export default useCampaigns; 