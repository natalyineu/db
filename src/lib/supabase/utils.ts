/**
 * Supabase utility functions
 * 
 * This file contains common utilities and helpers for Supabase operations.
 * It centralizes common operations to avoid duplication across the codebase.
 */

import { createBrowserClient, createServerClient, createAdminClient } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Debug flag, only enable logging in development
const DEBUG = process.env.NODE_ENV !== 'production';

/**
 * Get the singleton browser client
 * This is the recommended way to access Supabase in client components
 */
export function getBrowserClient(): SupabaseClient {
  return createBrowserClient();
}

/**
 * Get the server client
 */
export function getServerClient(): SupabaseClient {
  return createServerClient();
}

/**
 * Get the admin client with service role
 * IMPORTANT: Only use server-side; never expose in client code
 */
export function getAdminClient(): SupabaseClient {
  return createAdminClient();
}

/**
 * Helper for logging Supabase operations in development
 */
export function logDebug(message: string, ...args: any[]): void {
  if (DEBUG) {
    console.log(`[Supabase] ${message}`, ...args);
  }
}

/**
 * Helper for logging Supabase errors in development
 */
export function logError(message: string, error: any): void {
  if (DEBUG) {
    console.error(`[Supabase Error] ${message}`, error);
  }
} 