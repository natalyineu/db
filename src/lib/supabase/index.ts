/**
 * Export all Supabase-related functions and components
 * 
 * This file serves as the main entry point for Supabase functionality
 * All components should import from '@/lib/supabase' rather than
 * directly accessing the internal files
 */

// Export client functions
export * from './client';

// Export provider components
export * from './client-provider';

// Export utility functions
export * from './utils';

// Re-export types from supabase-js for convenience
export type { User, Session, SupabaseClient } from '@supabase/supabase-js'; 