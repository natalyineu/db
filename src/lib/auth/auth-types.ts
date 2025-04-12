import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';

// Define the shape of our auth context
export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  loadingState: {
    initial: boolean;
    signIn: boolean;
    signUp: boolean;
    signOut: boolean;
    profile: boolean;
  };
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session } | undefined>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null; } | undefined>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Debug mode flag
export const DEBUG = process.env.NODE_ENV !== 'production'; 