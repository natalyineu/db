'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useSupabase } from '../supabase/client-provider';
import { UserProfile } from '@/types';
import { AuthContextType, DEBUG } from './auth-types';
import { useProfileManager } from './auth-hooks';
import { createAuthMethods } from './auth-methods';
import { initializeAuth } from './auth-initialize';

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingState, setLoadingState] = useState({
    initial: true,
    signIn: false,
    signUp: false,
    signOut: false,
    profile: false
  });
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const router = useRouter();
  
  // Track initialization status
  const hasInitialized = useRef(false);
  
  // Get profile manager hooks
  const { fetchUserProfile: fetchProfileBase, ensureUserProfile: ensureProfileBase, isFetchingProfile } = useProfileManager(supabase);
  
  // Wrap the fetchUserProfile with state handling
  const fetchUserProfile = useCallback(async (userId: string) => {
    return fetchProfileBase(userId, setProfile, setError, setLoadingState);
  }, [fetchProfileBase]);
  
  // Wrap ensureUserProfile with our fetchUserProfile
  const ensureUserProfile = useCallback(async (userId: string, email: string, accessToken: string) => {
    const fetchUserProfileWrapper = async () => {
      await fetchUserProfile(userId);
    };
    
    return ensureProfileBase(userId, email, accessToken, fetchUserProfileWrapper);
  }, [ensureProfileBase, fetchUserProfile]);

  // Create auth methods
  const authMethods = createAuthMethods(supabase);
  
  // Refresh the user profile
  const refreshProfile = useCallback(async () => {
    if (user?.id && !isFetchingProfile.current) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile, isFetchingProfile]);

  // Initialize auth state - with optimizations to reduce flickering
  useEffect(() => {
    // Skip repeated initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    let mounted = true; // Track if component is mounted
    let initTimer: NodeJS.Timeout | null = null;
    
    const initialize = async () => {
      await initializeAuth(supabase, {
        mounted,
        setIsLoading,
        setLoadingState,
        setSession,
        setUser,
        setProfile,
        setError,
        fetchUserProfile
      });
      
      // The loading state is now handled in initializeAuth with a timeout guarantee
    };

    initialize();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (DEBUG) console.log('Auth state changed:', event);
        
        // Optimize by checking if session actually changed
        const sessionChanged = 
          (!session && !!session) || 
          (!!session && !session) || 
          (session?.user.id !== session?.user.id);
        
        if (sessionChanged) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Don't wait for profile fetch to complete - it'll update asynchronously
            fetchUserProfile(session.user.id).catch(err => {
              if (DEBUG) console.error('Error fetching profile on auth change:', err);
            });
          } else {
            setProfile(null);
          }
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

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    return authMethods.signIn(email, password, {
      setIsLoading,
      setLoadingState,
      setError,
      setSession, 
      setUser,
      ensureUserProfile
    });
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    return authMethods.signUp(email, password, {
      setIsLoading,
      setLoadingState,
      setError
    });
  };

  // Sign out
  const signOut = async () => {
    return authMethods.signOut({
      setIsLoading,
      setLoadingState,
      setError,
      setSession,
      setUser,
      setProfile,
      router
    });
  };

  // Compute the authenticated state - is user is available and verified
  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        loadingState,
        isAuthenticated,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 