'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchProfileDirect } from '@/utils/profile-utils';
import { UserProfile } from '@/types';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

interface UseProfileReturn {
  profile: UserProfile | null;
  localLoading: boolean;
  localError: string | null;
  retryCount: number;
  handleRetry: () => void;
}

export function useProfile(maxRetries = 3): UseProfileReturn {
  const { profile, user, isLoading, isAuthenticated, refreshProfile, error: authError } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  
  // Reset states when auth changes
  useEffect(() => {
    if (!isLoading) {
      setLocalLoading(false);
    }
  }, [isLoading]);
  
  // Direct profile fetch when retry fails
  const fetchProfileDirectly = useCallback(async () => {
    if (!user) return;
    
    try {
      if (DEBUG) console.log('Making direct database call to profiles table');
      const userProfile = await fetchProfileDirect(user.id);
      
      if (userProfile) {
        setLocalProfile(userProfile);
        setLocalError(null);
      } else {
        setLocalError('Unable to find your profile. Please try again later.');
      }
    } catch (error) {
      if (DEBUG) console.error('Direct profile fetch error:', error);
      setLocalError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLocalLoading(false);
    }
  }, [user]);
  
  // Retry logic for profile fetching
  useEffect(() => {
    if (!isLoading && isAuthenticated && !profile && retryCount < maxRetries) {
      if (DEBUG) console.log(`No profile found, will retry (${retryCount + 1}/${maxRetries})`);
      
      const timer = setTimeout(() => {
        if (DEBUG) console.log(`Retrying profile fetch (attempt ${retryCount + 1}/${maxRetries})`);
        refreshProfile();
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff
      
      return () => clearTimeout(timer);
    }
    
    // If we've retried maximum times and still no profile, try direct fetch
    if (!isLoading && isAuthenticated && !profile && retryCount >= maxRetries) {
      if (DEBUG) console.log('Maximum retry attempts reached, trying direct fetch');
      setLocalError('Unable to load your profile after multiple attempts.');
      fetchProfileDirectly();
    }
  }, [isLoading, isAuthenticated, profile, retryCount, maxRetries, refreshProfile, fetchProfileDirectly]);
  
  // Handle manual retry
  const handleRetry = useCallback(() => {
    setLocalLoading(true);
    setLocalError(null);
    setRetryCount(0);
    refreshProfile();
    setTimeout(() => setLocalLoading(false), 500);
  }, [refreshProfile]);
  
  return {
    profile: profile || localProfile,
    localLoading,
    localError: localError || authError,
    retryCount,
    handleRetry,
  };
} 