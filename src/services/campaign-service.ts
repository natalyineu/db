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

export class CampaignService {
  private static supabaseClient = createBrowserClient();

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

      const item = result as RawCampaignData;
      
      // Transform the data to ensure it matches our Campaign type
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
        assets: []
      };
    } catch (error) {
      if (DEBUG) {
        console.error('Error creating campaign:', error);
      }
      throw error;
    }
  }

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

      const item = result as RawAssetData;
      
      // Transform the data to ensure it matches our CampaignAsset type
      return {
        id: String(item.id || ''),
        campaign_id: String(item.campaign_id || ''),
        url: String(item.url || 'https://google.com'),
        drive_link: item.drive_link ? String(item.drive_link) : undefined,
        notes: item.notes ? String(item.notes) : undefined,
        created_at: String(item.created_at || new Date().toISOString()),
        updated_at: item.updated_at ? String(item.updated_at) : undefined
      };
    } catch (error) {
      if (DEBUG) {
        console.error('Error adding campaign asset:', error);
      }
      throw error;
    }
  }

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
      return data.map((item: RawCampaignData) => ({
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
        assets: Array.isArray(item.assets) ? item.assets.map((asset: RawAssetData) => ({
          id: String(asset.id || ''),
          campaign_id: String(asset.campaign_id || ''),
          url: String(asset.url || 'https://google.com'),
          drive_link: asset.drive_link ? String(asset.drive_link) : undefined,
          notes: asset.notes ? String(asset.notes) : undefined,
          created_at: String(asset.created_at || new Date().toISOString()),
          updated_at: asset.updated_at ? String(asset.updated_at) : undefined
        })) : []
      }));
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching campaigns:', error);
      }
      return [];
    }
  }

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

      const item = data as RawCampaignData;
      
      // Transform the data to ensure it matches our Campaign type
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
        assets: Array.isArray(item.assets) ? item.assets.map((asset: RawAssetData) => ({
          id: String(asset.id || ''),
          campaign_id: String(asset.campaign_id || ''),
          url: String(asset.url || 'https://google.com'),
          drive_link: asset.drive_link ? String(asset.drive_link) : undefined,
          notes: asset.notes ? String(asset.notes) : undefined,
          created_at: String(asset.created_at || new Date().toISOString()),
          updated_at: asset.updated_at ? String(asset.updated_at) : undefined
        })) : []
      };
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching campaign:', error);
      }
      return null;
    }
  }
} 