'use client';

/**
 * @deprecated This module is deprecated and will be removed in a future version.
 * Please use the new AuthProvider from '@/features/auth/hooks/useAuth' instead.
 */

import { ReactNode } from 'react';
import { 
  AuthProvider as NewAuthProvider, 
  useAuth as useNewAuth
} from '@/features/auth/hooks/useAuth';

// Log a deprecation warning in development
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '[DEPRECATED] The AuthProvider in src/lib/auth/auth-context.tsx is deprecated. ' +
    'Please use the new AuthProvider from @/features/auth/hooks/useAuth instead.'
  );
}

// Deprecated provider that forwards to the new implementation
export function AuthProvider({ children }: { children: ReactNode }) {
  return <NewAuthProvider>{children}</NewAuthProvider>;
}

// Deprecated hook that forwards to the new implementation
export function useAuth() {
  return useNewAuth();
} 