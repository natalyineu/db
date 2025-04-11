'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useSupabase } from '../supabase/client-provider';
import { UserProfile } from '@/types';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session } | undefined>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; } | undefined>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const router = useRouter();
  
  // Ref to track if a profile fetch is in progress
  const isFetchingProfile = useRef(false);
  // Ref to track last fetch time to prevent rapid requests
  const lastFetchTime = useRef(0);

  // Define fetchUserProfile with useCallback to prevent recreation on every render
  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent concurrent fetches and rate limit to no more than once per second
    const now = Date.now();
    if (isFetchingProfile.current || (now - lastFetchTime.current < 1000)) {
      if (DEBUG) console.log('Skipping profile fetch - already in progress or too soon');
      return;
    }
    
    // Initialize timeout ID
    let timeoutId: NodeJS.Timeout | undefined;
    
    try {
      isFetchingProfile.current = true;
      lastFetchTime.current = now;
      
      if (DEBUG) console.log('Fetching profile for user:', userId);
      
      // Direct database query with explicit headers and timeout
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Set up a race with a timeout promise - increased from 5 to 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Profile fetch timed out after 15 seconds')), 15000);
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
        
        setProfile({
          id: newData.id,
          email: newData.email,
          created_at: newData.created_at,
          updated_at: newData.updated_at,
          status: newData.status
        });
      } else {
        if (DEBUG) console.log('Profile fetched successfully:', data.email);
        
        setProfile({
          id: data.id,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status
        });
      }
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      if (DEBUG) console.error('Error fetching profile:', error);
      setProfile(null);
      
      // Set an error message for profile fetch failure
      if (error instanceof Error) {
        setError(`Failed to load profile: ${error.message}`);
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      isFetchingProfile.current = false;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true; // Track if component is mounted
    let initTimer: NodeJS.Timeout | null = null;
    
    const initializeAuth = async () => {
      try {
        if (mounted) setIsLoading(true);
        
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
      } finally {
        if (mounted) {
          // Ensure isLoading is set to false regardless of outcome
          initTimer = setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
              if (DEBUG) console.log('Auth initialization complete, loading state set to false');
            }
          }, 100); // Small delay to allow state updates to propagate
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (DEBUG) console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      mounted = false;
      if (initTimer) clearTimeout(initTimer);
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  // Ensure user profile exists for authenticated users
  const ensureUserProfile = useCallback(async (userId: string, email: string, accessToken: string) => {
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
        await fetchUserProfile(userId);
      }
    } catch (error) {
      if (DEBUG) console.error('Error ensuring user profile:', error);
    }
  }, [fetchUserProfile]);

  // Refresh the user profile
  const refreshProfile = useCallback(async () => {
    if (user?.id && !isFetchingProfile.current) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (DEBUG) console.log("Signing in with:", email);
      
      // Clear any existing session
      await supabase.auth.signOut();
      
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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
        
        // No longer need to manually redirect - let the component handle it through isAuthenticated
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
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (error) {
        throw error;
      }

      // Success - user needs to verify email
      return data;
    } catch (error) {
      if (DEBUG) console.error('Signup error:', error);
      setError(error instanceof AuthError ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      if (DEBUG) console.error('Signout error:', error);
      setError(error instanceof Error ? error.message : 'Signout failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate authenticated state
  const isAuthenticated = !!user && !!session;

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 