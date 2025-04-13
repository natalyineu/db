import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { UserProfile } from '@/types';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Debug flag for development-only logs
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Auth provider component that wraps the application and provides auth state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();
  const router = useRouter();
  
  // Use useRef for the flag to prevent it from causing re-renders
  const isFetchingProfile = useRef(false);

  // Fetch user profile from the database
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (isFetchingProfile.current) return;
    
    try {
      isFetchingProfile.current = true;
      
      if (DEBUG) console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        if (DEBUG) console.log('Profile fetched successfully:', data.email);
        
        setProfile({
          id: data.id,
          email: data.email,
          created_at: data.created_at,
          updated_at: data.updated_at,
          status: data.status,
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
        if (DEBUG) console.log('No profile found for user:', userId);
        setProfile(null);
      }
      
      setError(null);
    } catch (error) {
      if (DEBUG) console.error('Error fetching profile:', error);
      setProfile(null);
      setError('Failed to load profile data');
    } finally {
      isFetchingProfile.current = false;
    }
  }, [supabase]);

  // Refresh the user profile
  const refreshProfile = useCallback(async () => {
    if (user?.id && !isFetchingProfile.current) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        if (DEBUG) console.error('Error initializing auth:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
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
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      return { success: false, error: error.message || 'Failed to sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      return { success: false, error: error.message || 'Failed to sign up' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error: any) {
      setError(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute the authenticated state - is user available and verified
  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth; 