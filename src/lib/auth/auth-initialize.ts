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

  // Set a timeout to ensure we don't wait too long for initialization
  // This helps prevent UI flickering by ensuring loading state will end
  const initTimeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      if (DEBUG) console.log('Auth initialization timeout reached');
      resolve({ data: { session: null }, error: null });
    }, 2000); // 2 second timeout max
  });

  try {
    if (mounted) {
      setIsLoading(true);
      setLoadingState(prev => ({ ...prev, initial: true }));
    }
    
    if (DEBUG) console.log('Initializing auth context');
    
    // Get current session with explicit error handling and timeout
    try {
      // Race the session fetch with a timeout to ensure we don't wait too long
      const { data, error } = await Promise.race([
        supabase.auth.getSession(),
        initTimeoutPromise
      ]) as any;
      
      if (error) {
        throw error;
      }
      
      if (!mounted) return;
      
      const session = data.session;
      
      if (session && session.user) {
        if (DEBUG) console.log('Valid session found, user:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        // Start profile fetch, but don't await it to speed up initial render
        fetchUserProfile(session.user.id).catch(err => {
          if (DEBUG) console.error('Background profile fetch error:', err);
        });
      } else {
        if (DEBUG) console.log('No valid session found');
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (sessionError) {
      if (DEBUG) console.error('Error getting session:', sessionError);
      
      // Try refreshing the session if it failed, with timeout
      try {
        const { data: refreshData, error: refreshError } = await Promise.race([
          supabase.auth.refreshSession(),
          initTimeoutPromise
        ]) as any;
        
        if (refreshError) {
          throw refreshError;
        }
        
        if (!mounted) return;
        
        const refreshedSession = refreshData.session;
        
        if (refreshedSession && refreshedSession.user) {
          if (DEBUG) console.log('Session refreshed successfully, user:', refreshedSession.user.email);
          setSession(refreshedSession);
          setUser(refreshedSession.user);
          
          // Start profile fetch in background
          fetchUserProfile(refreshedSession.user.id).catch(err => {
            if (DEBUG) console.error('Background profile fetch error after refresh:', err);
          });
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
  } finally {
    // Always ensure loading state ends, even if there are errors
    if (mounted) {
      setTimeout(() => {
        if (mounted) {
          setIsLoading(false);
          setLoadingState(prev => ({ ...prev, initial: false }));
          if (DEBUG) console.log('Auth initialization complete, loading state set to false');
        }
      }, 100);
    }
  }
}; 