import type { Brief, BriefAsset, BriefStatus, BriefType } from '@/types';
import { createBrowserClient } from '@/lib/supabase';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * The "briefs" table in Supabase is used for storing brief data.
 * All CRUD operations use Brief terminology.
 */

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

type RawBriefData = Record<string, any>;
type RawAssetData = Record<string, any>;

// Brief creation interface
interface CreateBriefData {
  name: string;
  status: BriefStatus;
  type?: BriefType;
  user_id: string;
  start_date?: string;
  end_date?: string;
}

// Brief asset creation interface
interface CreateBriefAssetData {
  brief_id: string;
  url: string;
  drive_link?: string;
  notes?: string;
}

/**
 * Service responsible for brief-related operations
 */
export class BriefService {
  private static supabaseClient = createBrowserClient();

  /**
   * Creates a new brief
   * 
   * @param briefData - Data for the new brief
   * @returns The created brief or null if creation failed
   */
  static async createBrief(briefData: CreateBriefData): Promise<Brief | null> {
    try {
      // Convert to Record<string, unknown> for Supabase
      const data = {
        name: briefData.name,
        status: briefData.status,
        user_id: briefData.user_id,
        type: briefData.type || 'awareness' as BriefType, // Use provided type or default
        budget: 0, // Default budget
        ...(briefData.start_date && { start_date: briefData.start_date }),
        ...(briefData.end_date && { end_date: briefData.end_date })
      };
      
      const { data: result, error } = await this.supabaseClient
        .from('briefs')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      if (!result) return null;
      
      // Transform the data to ensure it matches our Brief type
      return this.transformBriefData(result);
    } catch (error) {
      if (DEBUG) {
        console.error('Error creating brief:', error);
      }
      throw error;
    }
  }

  /**
   * Adds an asset to a brief
   * 
   * @param assetData - Data for the new asset
   * @returns The created asset or null if creation failed
   */
  static async addBriefAsset(assetData: CreateBriefAssetData): Promise<BriefAsset | null> {
    try {
      // Convert to Record<string, unknown> for Supabase
      const data = {
        brief_id: assetData.brief_id,
        url: assetData.url,
        ...(assetData.drive_link && { drive_link: assetData.drive_link }),
        ...(assetData.notes && { notes: assetData.notes })
      };
      
      const { data: result, error } = await this.supabaseClient
        .from('assets')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      if (!result) return null;
      
      // Transform the data to ensure it matches our BriefAsset type
      return this.transformAssetData(result);
    } catch (error) {
      if (DEBUG) {
        console.error('Error adding brief asset:', error);
      }
      throw error;
    }
  }

  /**
   * Gets all briefs for a user
   * 
   * @param userId - The user ID to get briefs for
   * @returns Array of briefs
   */
  static async getBriefsByUserId(userId: string): Promise<Brief[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('briefs')
        .select(`
          *,
          assets:assets(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }

      // Transform the data to ensure it matches our Brief type
      return data.map((item: RawBriefData) => this.transformBriefData(item));
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching briefs:', error);
      }
      return [];
    }
  }

  /**
   * Gets a brief by ID
   * 
   * @param briefId - The brief ID to get
   * @returns The brief or null if not found
   */
  static async getBriefById(briefId: string): Promise<Brief | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('briefs')
        .select(`
          *,
          assets:assets(*)
        `)
        .eq('id', briefId)
        .single();

      if (error) throw error;
      
      if (!data) {
        return null;
      }

      // Transform the data to ensure it matches our Brief type
      return this.transformBriefData(data);
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching brief:', error);
      }
      return null;
    }
  }

  /**
   * Updates a brief
   * 
   * @param briefId - The ID of the brief to update
   * @param updateData - The data to update
   * @returns The updated brief or null if update failed
   */
  static async updateBrief(
    briefId: string, 
    updateData: Partial<Omit<Brief, 'id' | 'created_at' | 'assets'>>
  ): Promise<Brief | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('briefs')
        .update(updateData)
        .eq('id', briefId)
        .select(`
          *,
          assets:assets(*)
        `)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      return this.transformBriefData(data);
    } catch (error) {
      if (DEBUG) {
        console.error('Error updating brief:', error);
      }
      return null;
    }
  }

  /**
   * Deletes a brief
   * 
   * @param briefId - The ID of the brief to delete
   * @returns Boolean indicating success
   */
  static async deleteBrief(briefId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('briefs')
        .delete()
        .eq('id', briefId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      if (DEBUG) {
        console.error('Error deleting brief:', error);
      }
      return false;
    }
  }

  /**
   * Helper function to transform raw brief data into the Brief type
   */
  private static transformBriefData(item: RawBriefData): Brief {
    return {
      id: String(item.id || ''),
      name: String(item.name || ''),
      status: (item.status as BriefStatus) || 'draft',
      type: (item.type as BriefType) || 'display',
      created_at: String(item.created_at || new Date().toISOString()),
      updated_at: item.updated_at ? String(item.updated_at) : undefined,
      start_date: item.start_date ? String(item.start_date) : undefined,
      end_date: item.end_date ? String(item.end_date) : undefined,
      user_id: String(item.user_id || ''),
      budget: Number(item.budget || 0),
      spent: item.spent ? Number(item.spent) : undefined,
      roas: item.roas ? Number(item.roas) : undefined,
      impressions: item.impressions ? Number(item.impressions) : undefined,
      clicks: item.clicks ? Number(item.clicks) : undefined,
      conversions: item.conversions ? Number(item.conversions) : undefined,
      ctr: item.ctr ? Number(item.ctr) : undefined,
      description: item.description,
      target_audience: item.target_audience,
      platforms: item.platforms,
      performance_score: item.performance_score ? Number(item.performance_score) : undefined,
      assets: item.assets ? item.assets.map((asset: RawAssetData) => this.transformAssetData(asset)) : undefined
    };
  }

  /**
   * Helper function to transform raw asset data into the BriefAsset type
   */
  private static transformAssetData(asset: RawAssetData): BriefAsset {
    return {
      id: String(asset.id || ''),
      brief_id: String(asset.brief_id || asset.campaign_id || ''), // Handle both field names for compatibility
      url: String(asset.url || ''),
      drive_link: asset.drive_link,
      notes: asset.notes,
      created_at: String(asset.created_at || new Date().toISOString()),
      updated_at: asset.updated_at ? String(asset.updated_at) : undefined
    };
  }
} 