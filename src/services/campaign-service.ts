import { Campaign, CampaignAsset, CampaignStatus, CampaignType } from '@/types';
import { createBrowserClient } from '@/lib/supabase';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

type RawCampaignData = Record<string, any>;
type RawAssetData = Record<string, any>;

// Campaign creation interface
interface CreateCampaignData {
  name: string;
  status: CampaignStatus;
  user_id: string;
  start_date?: string;
  end_date?: string;
}

// Campaign asset creation interface
interface CreateCampaignAssetData {
  campaign_id: string;
  url: string;
  drive_link?: string;
  notes?: string;
}

/**
 * Service responsible for campaign-related operations
 */
export class CampaignService {
  private static supabaseClient = createBrowserClient();

  /**
   * Creates a new campaign
   * 
   * @param campaignData - Data for the new campaign
   * @returns The created campaign or null if creation failed
   */
  static async createCampaign(campaignData: CreateCampaignData): Promise<Campaign | null> {
    try {
      // Convert to Record<string, unknown> for Supabase
      const data = {
        name: campaignData.name,
        status: campaignData.status,
        user_id: campaignData.user_id,
        type: 'display' as CampaignType, // Default type
        budget: 0, // Default budget
        ...(campaignData.start_date && { start_date: campaignData.start_date }),
        ...(campaignData.end_date && { end_date: campaignData.end_date })
      };
      
      const { data: result, error } = await this.supabaseClient
        .from('campaigns')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      if (!result) return null;
      
      // Transform the data to ensure it matches our Campaign type
      return this.transformCampaignData(result);
    } catch (error) {
      if (DEBUG) {
        console.error('Error creating campaign:', error);
      }
      throw error;
    }
  }

  /**
   * Adds an asset to a campaign
   * 
   * @param assetData - Data for the new asset
   * @returns The created asset or null if creation failed
   */
  static async addCampaignAsset(assetData: CreateCampaignAssetData): Promise<CampaignAsset | null> {
    try {
      // Convert to Record<string, unknown> for Supabase
      const data = {
        campaign_id: assetData.campaign_id,
        url: assetData.url,
        ...(assetData.drive_link && { drive_link: assetData.drive_link }),
        ...(assetData.notes && { notes: assetData.notes })
      };
      
      const { data: result, error } = await this.supabaseClient
        .from('campaign_assets')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      if (!result) return null;
      
      // Transform the data to ensure it matches our CampaignAsset type
      return this.transformAssetData(result);
    } catch (error) {
      if (DEBUG) {
        console.error('Error adding campaign asset:', error);
      }
      throw error;
    }
  }

  /**
   * Gets all campaigns for a user
   * 
   * @param userId - The user ID to get campaigns for
   * @returns Array of campaigns
   */
  static async getCampaignsByUserId(userId: string): Promise<Campaign[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('campaigns')
        .select(`
          *,
          assets:campaign_assets(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }

      // Transform the data to ensure it matches our Campaign type
      return data.map((item: RawCampaignData) => this.transformCampaignData(item));
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching campaigns:', error);
      }
      return [];
    }
  }

  /**
   * Gets a campaign by ID
   * 
   * @param campaignId - The campaign ID to get
   * @returns The campaign or null if not found
   */
  static async getCampaignById(campaignId: string): Promise<Campaign | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('campaigns')
        .select(`
          *,
          assets:campaign_assets(*)
        `)
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      
      if (!data) {
        return null;
      }

      // Transform the data to ensure it matches our Campaign type
      return this.transformCampaignData(data);
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching campaign:', error);
      }
      return null;
    }
  }

  /**
   * Updates a campaign
   * 
   * @param campaignId - The ID of the campaign to update
   * @param updateData - The data to update
   * @returns The updated campaign or null if update failed
   */
  static async updateCampaign(
    campaignId: string, 
    updateData: Partial<Omit<Campaign, 'id' | 'created_at' | 'assets'>>
  ): Promise<Campaign | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .select(`
          *,
          assets:campaign_assets(*)
        `)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      return this.transformCampaignData(data);
    } catch (error) {
      if (DEBUG) {
        console.error('Error updating campaign:', error);
      }
      return null;
    }
  }

  /**
   * Deletes a campaign
   * 
   * @param campaignId - The ID of the campaign to delete
   * @returns Boolean indicating success
   */
  static async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      if (DEBUG) {
        console.error('Error deleting campaign:', error);
      }
      return false;
    }
  }

  /**
   * Helper function to transform raw campaign data into the Campaign type
   */
  private static transformCampaignData(item: RawCampaignData): Campaign {
    return {
      id: String(item.id || ''),
      name: String(item.name || ''),
      status: (item.status as CampaignStatus) || 'draft',
      type: (item.type as CampaignType) || 'display',
      created_at: String(item.created_at || new Date().toISOString()),
      updated_at: item.updated_at ? String(item.updated_at) : undefined,
      start_date: item.start_date ? String(item.start_date) : undefined,
      end_date: item.end_date ? String(item.end_date) : undefined,
      user_id: String(item.user_id || ''),
      budget: Number(item.budget || 0),
      spent: Number(item.spent || 0),
      roas: item.roas ? Number(item.roas) : undefined,
      impressions: item.impressions ? Number(item.impressions) : undefined,
      clicks: item.clicks ? Number(item.clicks) : undefined,
      conversions: item.conversions ? Number(item.conversions) : undefined,
      ctr: item.ctr ? Number(item.ctr) : undefined,
      description: item.description ? String(item.description) : undefined,
      target_audience: item.target_audience ? String(item.target_audience) : undefined,
      platforms: Array.isArray(item.platforms) ? item.platforms : undefined,
      performance_score: item.performance_score ? Number(item.performance_score) : undefined,
      assets: Array.isArray(item.assets) 
        ? item.assets.map((asset: RawAssetData) => this.transformAssetData(asset)) 
        : []
    };
  }

  /**
   * Helper function to transform raw asset data into the CampaignAsset type
   */
  private static transformAssetData(asset: RawAssetData): CampaignAsset {
    return {
      id: String(asset.id || ''),
      campaign_id: String(asset.campaign_id || ''),
      url: String(asset.url || 'https://google.com'),
      drive_link: asset.drive_link ? String(asset.drive_link) : undefined,
      notes: asset.notes ? String(asset.notes) : undefined,
      created_at: String(asset.created_at || new Date().toISOString()),
      updated_at: asset.updated_at ? String(asset.updated_at) : undefined
    };
  }
} 