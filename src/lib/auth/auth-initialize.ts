'use client';

import { SupabaseClient } from '@supabase/supabase-js';
import { DEBUG } from './auth-types';

/**
 * Initialize auth state for a user session
 */
export const initializeAuth = async (
  supabase: SupabaseClient,
  options: {
    mounted: boolean;
    setIsLoading: (value: boolean) => void;
    setLoadingState: (updater: (prev: any) => any) => void;
    setSession: (session: any) => void;
    setUser: (user: any) => void;
    setProfile: (profile: any) => void;
    setError: (error: string | null) => void;
    fetchUserProfile: (userId: string) => Promise<void>;
  }
) => {
  const { 
    mounted, 
    setIsLoading, 
    setLoadingState, 
    setSession, 
    setUser, 
    setProfile, 
    setError, 
    fetchUserProfile 
  } = options;

  try {
    if (mounted) {
      setIsLoading(true);
      setLoadingState(prev => ({ ...prev, initial: true }));
    }
    
    if (DEBUG) console.log('Initializing auth context');
    
    // Get current session with explicit error handling
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (!mounted) return;
      
      const session = data.session;
      
      if (session && session.user) {
        if (DEBUG) console.log('Valid session found, user:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        // Fetch user profile if we have a valid user ID
        await fetchUserProfile(session.user.id);
      } else {
        if (DEBUG) console.log('No valid session found');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (sessionError) {
      if (DEBUG) console.error('Error getting session:', sessionError);
      
      // Try refreshing the session if it failed
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          throw refreshError;
        }
        
        if (!mounted) return;
        
        const refreshedSession = refreshData.session;
        
        if (refreshedSession && refreshedSession.user) {
          if (DEBUG) console.log('Session refreshed successfully, user:', refreshedSession.user.email);
          setSession(refreshedSession);
          setUser(refreshedSession.user);
          
          // Fetch user profile with refreshed session
          await fetchUserProfile(refreshedSession.user.id);
        } else {
          if (DEBUG) console.log('No valid session after refresh');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (refreshError) {
        if (DEBUG) console.error('Failed to refresh session:', refreshError);
        throw refreshError;
      }
    }
  } catch (error) {
    if (!mounted) return;
    
    if (DEBUG) console.error('Error initializing auth:', error);
    setError(error instanceof Error ? error.message : 'Authentication error');
    
    // Clear auth state on errors
    setSession(null);
    setUser(null);
    setProfile(null);
  }
}; 