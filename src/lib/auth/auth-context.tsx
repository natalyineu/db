'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // Define fetchUserProfile at the component level so it's accessible to all functions
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (error) {
      if (DEBUG) console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user profile
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        if (DEBUG) console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]); // Add fetchUserProfile to dependencies

  // Ensure user profile exists for authenticated users
  const ensureUserProfile = async (userId: string, email: string, accessToken: string) => {
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
      
      // Refresh profile after ensuring it exists
      await fetchUserProfile(userId);
    } catch (error) {
      if (DEBUG) console.error('Error ensuring user profile:', error);
    }
  };

  // Refresh the user profile
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

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