import { createBrowserClient } from '@/lib/supabase';
import { ProfilePlan } from './types';

/**
 * Hook to get the impression limit from a user profile
 * Extracted from the useBriefForm hook for better modularity
 */
export async function getImpressionLimit(profile: any): Promise<number> {
  const defaultLimit = 16500;
  const supabase = createBrowserClient();
  
  try {
    console.log('Fetching impression limit from profile:', profile);
    
    if (!profile) {
      console.log('No profile data available, using default limit:', defaultLimit);
      return defaultLimit;
    }
    
    if (!profile.plan) {
      console.log('No plan data in profile, using default limit:', defaultLimit);
      return defaultLimit;
    }
    
    // Try to get actual plan limit from profile
    if (typeof profile.plan === 'object') {
      console.log('Plan object found in profile:', profile.plan);
      
      // If plan has impressions_limit directly
      if (profile.plan.impressions_limit) {
        console.log('Found direct impressions_limit in plan:', profile.plan.impressions_limit);
        return profile.plan.impressions_limit;
      } 
      // If plan has id that references plans table
      else if (profile.plan.id) {
        console.log('Found plan ID, fetching from plans table:', profile.plan.id);
        
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('impressions_limit')
          .eq('id', profile.plan.id)
          .single();
          
        if (planError) {
          console.error('Error fetching plan from ID:', planError);
          return defaultLimit;
        }
          
        if (planData?.impressions_limit) {
          console.log('Found impressions_limit in plans table:', planData.impressions_limit);
          return planData.impressions_limit;
        }
      }
      
      // If we have a plan name but no id or direct limit
      else if (profile.plan.name) {
        console.log('Found plan name, fetching from plans table by name:', profile.plan.name);
        
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('impressions_limit')
          .eq('name', profile.plan.name)
          .single();
          
        if (planError) {
          console.error('Error fetching plan from name:', planError);
          return defaultLimit;
        }
          
        if (planData?.impressions_limit) {
          console.log('Found impressions_limit by plan name:', planData.impressions_limit);
          return planData.impressions_limit;
        }
      }
    }
    // If plan is a string (plan name)
    else if (typeof profile.plan === 'string') {
      console.log('Plan is a string, fetching from plans table by name:', profile.plan);
      
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('impressions_limit')
        .eq('name', profile.plan)
        .single();
        
      if (planError) {
        console.error('Error fetching plan from string name:', planError);
        return defaultLimit;
      }
        
      if (planData?.impressions_limit) {
        console.log('Found impressions_limit by string plan name:', planData.impressions_limit);
        return planData.impressions_limit;
      }
    }
    
    console.log('No matching plan found, using default limit:', defaultLimit);
    return defaultLimit;
  } catch (error) {
    console.error('Error getting impression limit:', error);
    return defaultLimit;
  }
}; 