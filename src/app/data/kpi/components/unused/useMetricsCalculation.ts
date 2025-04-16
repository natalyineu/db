import { useMemo } from 'react';
import { KpiData, LatestMetrics } from '../types';

/**
 * Hook to calculate latest metrics and trends from KPI data
 * @param kpiData Array of KPI data points
 * @param defaultImpressionLimit Default impression limit to use if no data available
 * @returns Calculated latest metrics
 */
export function useMetricsCalculation(kpiData: KpiData[], defaultImpressionLimit: number) {
  // Calculate latest metrics
  const latestMetrics: LatestMetrics = useMemo(() => {
    if (kpiData.length === 0) {
      return {
        impressions: 0,
        impressions_plan: defaultImpressionLimit,
        clicks: 0,
        clicks_plan: Math.round(defaultImpressionLimit * 0.02),
        reach: 0,
        reach_plan: Math.round(defaultImpressionLimit * 0.7),
        deltaImpressions: 0,
        deltaClicks: 0,
        deltaReach: 0
      };
    }

    // Get latest metrics (sorted by date descending)
    const latest = kpiData[0];
    
    // Calculate deltas if we have multiple data points
    let deltaImpressions = 0;
    let deltaClicks = 0;
    let deltaReach = 0;
    
    if (kpiData.length > 1) {
      const previous = kpiData[1];
      
      // Avoid division by zero
      if (previous.impressions > 0) {
        deltaImpressions = ((latest.impressions - previous.impressions) / previous.impressions) * 100;
      }
      
      if (previous.clicks > 0) {
        deltaClicks = ((latest.clicks - previous.clicks) / previous.clicks) * 100;
      }
      
      if (previous.reach > 0) {
        deltaReach = ((latest.reach - previous.reach) / previous.reach) * 100;
      }
    }
    
    return {
      impressions: latest.impressions,
      impressions_plan: latest.impressions_plan,
      clicks: latest.clicks,
      clicks_plan: latest.clicks_plan,
      reach: latest.reach,
      reach_plan: latest.reach_plan,
      deltaImpressions,
      deltaClicks,
      deltaReach
    };
  }, [kpiData, defaultImpressionLimit]);

  // Calculate KPI performance scores
  const performanceScores = useMemo(() => {
    if (kpiData.length === 0) return { overall: 0, impressions: 0, clicks: 0, reach: 0 };

    // Calculate percentage of targets achieved
    const latest = kpiData[0];
    
    const impressionsScore = latest.impressions_plan > 0
      ? Math.min(100, (latest.impressions / latest.impressions_plan) * 100)
      : 0;
      
    const clicksScore = latest.clicks_plan > 0
      ? Math.min(100, (latest.clicks / latest.clicks_plan) * 100)
      : 0;
      
    const reachScore = latest.reach_plan > 0
      ? Math.min(100, (latest.reach / latest.reach_plan) * 100)
      : 0;
    
    // Overall score is average of the three scores
    const overall = (impressionsScore + clicksScore + reachScore) / 3;
    
    return {
      overall: Math.round(overall),
      impressions: Math.round(impressionsScore),
      clicks: Math.round(clicksScore),
      reach: Math.round(reachScore)
    };
  }, [kpiData]);

  return {
    latestMetrics,
    performanceScores
  };
} 