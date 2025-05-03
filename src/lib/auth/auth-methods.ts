'use client';

import { AuthError, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { DEBUG } from './auth-types';

/**
 * Handle auth methods with the Supabase client
 */
export const createAuthMethods = (supabase: SupabaseClient) => {
  /**
   * Sign in with email and password
   */
  const signIn = async (
    email: string, 
    password: string,
    options: {
      setIsLoading: (value: boolean) => void;
      setLoadingState: (updater: (prev: any) => any) => void;
      setError: (error: string | null) => void;
      setSession: (session: Session | null) => void;
      setUser: (user: User | null) => void;
      ensureUserProfile: (userId: string, email: string, accessToken: string) => Promise<void>;
    }
  ) => {
    const { setIsLoading, setLoadingState, setError, setSession, setUser, ensureUserProfile } = options;
    
    try {
      setIsLoading(true);
      setLoadingState(prev => ({ ...prev, signIn: true }));
      setError(null);
      
      if (DEBUG) console.log("Signing in with:", email);
      
      // Don't clear existing session before sign-in, this can cause token issues
      
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      if (DEBUG) console.log("Login successful, session:", data.session ? "present" : "missing");

      if (data.session) {
        // Set session and user
        setSession(data.session);
        setUser(data.user);
        
        // Ensure profile exists and fetch it
        if (data.user) {
          await ensureUserProfile(data.user.id, data.user.email || '', data.session.access_token);
        }
        
        return data;
      } else {
        throw new Error("Login succeeded but no session was created");
      }
    } catch (error) {
      if (DEBUG) console.error('Login error:', error);
      setError(error instanceof AuthError ? error.message : 'Authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingState(prev => ({ ...prev, signIn: false }));
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string, 
    password: string,
    options: {
      setIsLoading: (value: boolean) => void;
      setLoadingState: (updater: (prev: any) => any) => void;
      setError: (error: string | null) => void;
    }
  ) => {
    const { setIsLoading, setLoadingState, setError } = options;
    
    try {
      setIsLoading(true);
      setLoadingState(prev => ({ ...prev, signUp: true }));
      setError(null);
      
      if (DEBUG) console.log("Signing up with:", email);
      
      // Get current origin for redirectTo
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Sign up with redirectTo option for email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            email: email,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (DEBUG) console.log("Registration successful, session:", data.session ? "present" : "missing");
      
      return data;
    } catch (error) {
      if (DEBUG) console.error('Registration error:', error);
      setError(error instanceof AuthError ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
      setLoadingState(prev => ({ ...prev, signUp: false }));
    }
  };

  /**
   * Sign out
   */
  const signOut = async (
    options: {
      setIsLoading: (value: boolean) => void;
      setLoadingState: (updater: (prev: any) => any) => void;
      setError: (error: string | null) => void;
      setSession: (session: Session | null) => void;
      setUser: (user: User | null) => void;
      setProfile: (profile: any | null) => void;
      router: any;
    }
  ) => {
    const { setIsLoading, setLoadingState, setError, setSession, setUser, setProfile, router } = options;
    
    try {
      setIsLoading(true);
      setLoadingState(prev => ({ ...prev, signOut: true }));
      
      if (DEBUG) console.log("Signing out");
      
      // First perform client-side cleanup regardless of session state
      // This ensures the user is always "logged out" from the app's perspective
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Clear any stored auth data from local storage to be thorough
      if (typeof window !== 'undefined') {
        // Remove specific Supabase auth items from local storage
        const keys = Object.keys(localStorage);
        const supabaseKeys = keys.filter(key => key.startsWith('sb-') || key.includes('supabase'));
        
        for (const key of supabaseKeys) {
          localStorage.removeItem(key);
        }
      }
      
      try {
        // Try to sign out with Supabase - this might fail if there's no session
        await supabase.auth.signOut({ scope: 'local' });
        if (DEBUG) console.log("Supabase sign out successful");
      } catch (signOutError: any) {
        // If we get AuthSessionMissingError, that's expected in some cases
        if (signOutError.name === 'AuthSessionMissingError') {
          if (DEBUG) console.log('No active session found, but client-side logout completed');
        } else {
          // For other errors, log but don't throw - we still want to redirect
          if (DEBUG) console.error('Supabase sign out error:', signOutError);
        }
      }
      
      if (DEBUG) console.log("Sign out process completed");
      
      // Redirect to homepage
      router.push('/');
    } catch (error) {
      if (DEBUG) console.error('Sign out process error:', error);
      setError(error instanceof AuthError ? error.message : 'Sign out failed');
      
      // Even if there's an error, redirect to homepage
      router.push('/');
    } finally {
      setIsLoading(false);
      setLoadingState(prev => ({ ...prev, signOut: false }));
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
}; 