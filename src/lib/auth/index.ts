'use strict';

/**
 * @deprecated This module is deprecated and will be removed in a future version.
 * Please import from '@/features/auth/hooks/useAuth' instead.
 */

export { 
  AuthProvider,
  useAuth
} from './auth-context';

// Log a deprecation warning in development
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '[DEPRECATED] Importing from @/lib/auth is deprecated. ' +
    'Please import from @/features/auth/hooks/useAuth instead.'
  );
}

// Re-export types to maintain backward compatibility
export type { AuthContextType } from './auth-types';
