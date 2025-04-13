'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { fetchProfileDirect } from '@/utils';
import { UserProfile } from '@/types';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  retry: () => void;
}

export function useProfile(maxRetries = 3): UseProfileReturn {
  const { profile, user, isLoading, isAuthenticated, refreshProfile, error: authError } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  
  // Reset states when auth changes
  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
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
        setError(null);
      } else {
        setError('Unable to find your profile. Please try again later.');
      }
    } catch (error) {
      if (DEBUG) console.error('Direct profile fetch error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Simple retry logic
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (!isLoading && isAuthenticated && !profile && retryCount < maxRetries) {
      timer = setTimeout(() => {
        refreshProfile();
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1)); // Exponential backoff
    } else if (!isLoading && isAuthenticated && !profile && retryCount >= maxRetries) {
      setError('Unable to load your profile after multiple attempts.');
      fetchProfileDirectly();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated, profile, retryCount, maxRetries, refreshProfile, fetchProfileDirectly]);
  
  // Handle manual retry
  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    refreshProfile();
    setTimeout(() => setLoading(false), 500);
  }, [refreshProfile]);
  
  return {
    profile: profile || localProfile,
    loading,
    error: error || authError,
    retryCount,
    retry,
  };
} 