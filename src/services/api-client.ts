import { createBrowserClient } from '@/lib/supabase';
import { captureError } from './error-handler';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Base API client with error handling and logging
 */
export class ApiClient {
  // Use the same supabase client throughout the app
  private static supabaseClient = createBrowserClient();
  
  /**
   * Get the Supabase client instance
   */
  static getSupabaseClient() {
    return this.supabaseClient;
  }
  
  /**
   * Wrapper for fetch with timeout and error handling
   */
  static async fetchWithTimeout<T>(
    url: string, 
    options: RequestInit = {}, 
    timeoutMs = 5000
  ): Promise<T> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // Add signal to options
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };
      
      // Execute fetch
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // Handle non-success responses
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse and return response
      return await response.json() as T;
    } catch (error) {
      if (DEBUG) console.error('API request failed:', error);
      throw captureError(error, `API request to ${url}`);
    }
  }
}

/**
 * Fetch with automatic retries
 */
export async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  retries = 3, 
  backoffMs = 300
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    // Wait with exponential backoff before retrying
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    
    if (DEBUG) console.log(`Retrying fetch (${retries} attempts left)...`);
    return fetchWithRetry(url, options, retries - 1, backoffMs * 2);
  }
} 