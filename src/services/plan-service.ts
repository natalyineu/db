import { createBrowserClient } from '@/lib/supabase';
import { captureError } from './error-handler';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Service for handling plan-related operations
 */
export class PlanService {
  private static supabase = createBrowserClient();
  
  /**
   * Update a user's plan in the profiles table
   * 
   * @param userId - The ID of the user whose plan is being updated
   * @param planName - The name of the plan to set (e.g., 'Starter', 'Growth', 'Enterprise')
   * @returns Promise resolving to success status
   */
  static async updatePlan(userId: string, planName: string): Promise<boolean> {
    try {
      if (DEBUG) console.log('PlanService: Updating plan for user:', userId, 'to:', planName);
      
      // Get the current session for authentication
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Use the API endpoint for better server-side validation
      const response = await fetch('/api/update-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId,
          plan: planName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }
      
      // Parse the response
      const result = await response.json();
      
      if (DEBUG) console.log('PlanService: Plan updated successfully', result);
      return true;
    } catch (error) {
      captureError(error, 'PlanService.updatePlan');
      return false;
    }
  }
  
  /**
   * Get the available plans from the database
   * 
   * @returns Promise resolving to an array of plan objects
   */
  static async getAvailablePlans() {
    try {
      if (DEBUG) console.log('PlanService: Fetching available plans');
      
      const { data, error } = await this.supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      captureError(error, 'PlanService.getAvailablePlans');
      return [];
    }
  }
  
  /**
   * Get a user's current plan details
   * 
   * @param userId - The ID of the user
   * @returns Promise resolving to the user's plan details
   */
  static async getUserPlan(userId: string) {
    try {
      if (DEBUG) console.log('PlanService: Fetching plan for user:', userId);
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data?.plan || null;
    } catch (error) {
      captureError(error, 'PlanService.getUserPlan');
      return null;
    }
  }
} 