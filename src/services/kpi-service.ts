import { CampaignKPI, MetricData } from '@/types';
import { createBrowserClient } from '@/lib/supabase';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

type RawKpiData = Record<string, any>;

// KPI creation interface
interface CreateKpiData {
  campaign_id: string;
  date: string;
  budget_plan: number;
  budget_fact: number;
  impressions_plan: number;
  impressions_fact: number;
  clicks_plan: number;
  clicks_fact: number;
  reach_plan: number;
  reach_fact: number;
}

export class KpiService {
  private static supabaseClient = createBrowserClient();

  static async createKpi(kpiData: CreateKpiData): Promise<CampaignKPI | null> {
    try {
      // Calculate percentages
      const budgetPercentage = kpiData.budget_fact / kpiData.budget_plan * 100;
      const impressionsPercentage = kpiData.impressions_fact / kpiData.impressions_plan * 100;
      const clicksPercentage = kpiData.clicks_fact / kpiData.clicks_plan * 100;
      const reachPercentage = kpiData.reach_fact / kpiData.reach_plan * 100;
      
      // Convert to Record<string, unknown> for Supabase
      const data = {
        campaign_id: kpiData.campaign_id,
        date: kpiData.date,
        budget_plan: kpiData.budget_plan,
        budget_fact: kpiData.budget_fact,
        budget_percentage: budgetPercentage,
        impressions_plan: kpiData.impressions_plan,
        impressions_fact: kpiData.impressions_fact,
        impressions_percentage: impressionsPercentage,
        clicks_plan: kpiData.clicks_plan,
        clicks_fact: kpiData.clicks_fact,
        clicks_percentage: clicksPercentage,
        reach_plan: kpiData.reach_plan,
        reach_fact: kpiData.reach_fact,
        reach_percentage: reachPercentage
      };
      
      const { data: result, error } = await this.supabaseClient
        .from('kpi')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      if (!result) return null;

      return this.transformKpiData(result as RawKpiData);
    } catch (error) {
      if (DEBUG) {
        console.error('Error creating KPI data:', error);
      }
      throw error;
    }
  }

  static async getKpiByCampaignId(campaignId: string): Promise<CampaignKPI[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('kpi')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }

      // Transform the data to match our CampaignKPI type
      return data.map((item: RawKpiData) => this.transformKpiData(item));
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching KPIs:', error);
      }
      return [];
    }
  }

  static async getLatestKpiForCampaigns(campaignIds: string[]): Promise<Record<string, CampaignKPI>> {
    try {
      // For each campaign, get the most recent KPI data
      const promises = campaignIds.map(async (campaignId) => {
        const { data, error } = await this.supabaseClient
          .from('kpi')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          return [campaignId, null];
        }

        return [campaignId, this.transformKpiData(data as RawKpiData)];
      });

      const results = await Promise.all(promises);
      
      // Convert to object with campaign ID as key
      return results.reduce((acc, [campaignId, kpi]) => {
        if (kpi) {
          acc[campaignId as string] = kpi as CampaignKPI;
        }
        return acc;
      }, {} as Record<string, CampaignKPI>);
    } catch (error) {
      if (DEBUG) {
        console.error('Error fetching latest KPIs:', error);
      }
      return {};
    }
  }

  // Helper method to transform raw data into CampaignKPI type
  private static transformKpiData(item: RawKpiData): CampaignKPI {
    const createMetricData = (plan: number, fact: number, percentage: number): MetricData => ({
      plan,
      fact,
      percentage
    });

    return {
      id: String(item.id || ''),
      campaign_id: String(item.campaign_id || ''),
      date: String(item.date || ''),
      budget: createMetricData(
        Number(item.budget_plan || 0),
        Number(item.budget_fact || 0),
        Number(item.budget_percentage || 0)
      ),
      impressions: createMetricData(
        Number(item.impressions_plan || 0),
        Number(item.impressions_fact || 0),
        Number(item.impressions_percentage || 0)
      ),
      clicks: createMetricData(
        Number(item.clicks_plan || 0),
        Number(item.clicks_fact || 0),
        Number(item.clicks_percentage || 0)
      ),
      reach: createMetricData(
        Number(item.reach_plan || 0),
        Number(item.reach_fact || 0),
        Number(item.reach_percentage || 0)
      ),
      created_at: String(item.created_at || new Date().toISOString()),
      updated_at: item.updated_at ? String(item.updated_at) : undefined
    };
  }
} 