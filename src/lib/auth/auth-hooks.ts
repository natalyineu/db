'use client';

import { useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import { DEBUG } from './auth-types';

/**
 * Hook for managing user profile fetching
 */
export const useProfileManager = (supabase: SupabaseClient) => {
  // Ref to track if a profile fetch is in progress
  const isFetchingProfile = useRef(false);
  // Ref to track last fetch time to prevent rapid requests
  const lastFetchTime = useRef(0);
  // Cache the profile to reduce flickering on re-renders
  const profileCache = useRef<{[userId: string]: UserProfile | null}>({});

  // Define fetchUserProfile with useCallback to prevent recreation on every render
  const fetchUserProfile = useCallback(async (userId: string, setProfile: (profile: UserProfile | null) => void, setError: (error: string | null) => void, setLoadingState: (updater: (prev: any) => any) => void) => {
    // Check cache first to reduce flickering
    if (profileCache.current[userId]) {
      if (DEBUG) console.log('Using cached profile for user:', userId);
      setProfile(profileCache.current[userId]);
      // Still fetch in background to ensure fresh data
    }
    
    // Prevent concurrent fetches and rate limit to no more than once per 500ms (reduced from 1000ms)
    const now = Date.now();
    if (isFetchingProfile.current || (now - lastFetchTime.current < 500)) {
      if (DEBUG) console.log('Skipping profile fetch - already in progress or too soon');
      return;
    }
    
    // Initialize timeout ID
    let timeoutId: NodeJS.Timeout | undefined;
    
    try {
      isFetchingProfile.current = true;
      lastFetchTime.current = now;
      setLoadingState(prev => ({ ...prev, profile: true }));
      
      if (DEBUG) console.log('Fetching profile for user:', userId);
      
      // Direct database query with explicit headers and timeout
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Set up a race with a timeout promise - now 5 seconds (reduced from 15)
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile fetch timed out after 5 seconds')), 5000);
      });
      
      // Race the fetch against the timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;
      
      // Clear the timeout now that we have a result
      if (timeoutId) clearTimeout(timeoutId);
      
      if (error) {
        throw error;
      }

      if (!data) {
        // Create profile if it doesn't exist
        if (DEBUG) console.log('No profile found, attempting to create one');
        
        // Get session for token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session found when trying to create profile');
        }
        
        // Call API to ensure profile
        const response = await fetch('/api/ensure-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create profile: ${errorText}`);
        }
        
        // Try fetching again after creating
        const { data: newData, error: newError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (newError) {
          throw newError;
        }
        
        if (!newData) {
          throw new Error('Profile could not be created or fetched');
        }
        
        if (DEBUG) console.log('Profile created and fetched successfully:', newData.email);
        
        const newProfile = {
          id: newData.id,
          email: newData.email,
          created_at: newData.created_at,
          updated_at: newData.updated_at,
          status: newData.status ? String(newData.status) : undefined
        };
        
        // Update cache
        profileCache.current[userId] = newProfile;
        setProfile(newProfile);
      } else {
        if (DEBUG) console.log('Profile fetched successfully:', data.email);
        
        const existingProfile = {
          id: data.id,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status ? String(data.status) : undefined
        };
        
        // Update cache
        profileCache.current[userId] = existingProfile;
        setProfile(existingProfile);
      }
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      if (DEBUG) console.error('Error fetching profile:', error);
      if (!profileCache.current[userId]) {
        setProfile(null);
      }
      
      // Set an error message for profile fetch failure
      if (error instanceof Error) {
        setError(`Failed to load profile: ${error.message}`);
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      isFetchingProfile.current = false;
      setLoadingState(prev => ({ ...prev, profile: false }));
    }
  }, [supabase]);

  // Ensure user profile exists
  const ensureUserProfile = useCallback(async (userId: string, email: string, accessToken: string, fetchUserProfileFn: () => Promise<void>) => {
    try {
      const response = await fetch('/api/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (DEBUG) console.error('Failed to ensure user profile:', await response.text());
      }
      
      // Refresh profile after ensuring it exists, but only if not already fetching
      if (!isFetchingProfile.current) {
        await fetchUserProfileFn();
      }
    } catch (error) {
      if (DEBUG) console.error('Error ensuring user profile:', error);
    }
  }, []);

  return {
    fetchUserProfile,
    ensureUserProfile,
    isFetchingProfile
  };
}; 