import { Campaign, CampaignAsset, CampaignStatus } from '@/types';
import { createBrowserClient } from '@/lib/supabase';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

type RawCampaignData = Record<string, any>;
type RawAssetData = Record<string, any>;

export class CampaignService {
  private static supabaseClient = createBrowserClient();

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
        created_at: String(item.created_at || new Date().toISOString()),
        updated_at: item.updated_at ? String(item.updated_at) : undefined,
        start_date: item.start_date ? String(item.start_date) : undefined,
        end_date: item.end_date ? String(item.end_date) : undefined,
        user_id: String(item.user_id || ''),
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
        created_at: String(item.created_at || new Date().toISOString()),
        updated_at: item.updated_at ? String(item.updated_at) : undefined,
        start_date: item.start_date ? String(item.start_date) : undefined,
        end_date: item.end_date ? String(item.end_date) : undefined,
        user_id: String(item.user_id || ''),
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