import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Hook for accessing and managing the current user's profile
 */
export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the singleton Supabase client instance
  const supabase = createBrowserClient();
  
  /**
   * Ensure the user profile exists via API
   */
  const ensureProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      if (DEBUG) console.log('[useProfile] Ensuring profile existence via API');
      
      const response = await fetch('/api/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(({ data }) => data.session?.access_token)}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ensure profile: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.profile) {
        setProfile(data.profile);
        setError(null);
      }
    } catch (err) {
      if (DEBUG) console.error('[useProfile] Error ensuring profile:', err);
      setError('Failed to create profile');
    }
  }, [user, supabase]);
  
  /**
   * Get profile directly from API as fallback
   */
  const getProfileFromApi = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      if (DEBUG) console.log('[useProfile] Getting profile directly from API');
      
      const response = await fetch(`/api/get-profile-direct?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get profile: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.profile) {
        setProfile(data.profile);
        setError(null);
      }
    } catch (err) {
      if (DEBUG) console.error('[useProfile] Error getting profile from API:', err);
      // Keep the original error message
    }
  }, [user]);
  
  /**
   * Fetch user profile from the database
   */
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (DEBUG) console.log('[useProfile] Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        if (DEBUG) console.log('[useProfile] Profile fetched successfully');
        
        setProfile({
          id: data.id,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status,
          plan: data.plan || 'Starter',
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          postal_code: data.postal_code,
          notification_preferences: data.notification_preferences,
          theme_preference: data.theme_preference,
          last_login: data.last_login,
          login_count: data.login_count,
        });
      } else {
        // If not found, try to ensure profile via API
        await ensureProfile();
      }
    } catch (err) {
      if (DEBUG) console.error('[useProfile] Error fetching profile:', err);
      setError('Failed to load profile data');
      
      // Attempt to get profile directly from API as fallback
      await getProfileFromApi();
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase, ensureProfile, getProfileFromApi]);
  
  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user?.id || !profile) {
      return { success: false, error: 'User not authenticated or profile not loaded' };
    }
    
    try {
      if (DEBUG) console.log('[useProfile] Updating profile');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      
      if (data?.[0]) {
        // Update local profile state
        setProfile(prev => ({
          ...prev!,
          ...data[0]
        }));
      }
      
      return { success: true };
    } catch (err) {
      if (DEBUG) console.error('[useProfile] Error updating profile:', err);
      setError('Failed to update profile');
      return { 
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, [user, profile, supabase]);
  
  // Load profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchProfile]);
  
  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile
  };
} 