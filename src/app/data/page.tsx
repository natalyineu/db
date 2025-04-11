'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from './dashboard';
import { useAuth } from '@/lib/auth/auth-context';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function DataPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      if (DEBUG) console.log('No authenticated user found, redirecting to login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // If not authenticated but still loading, show loading
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  // User is authenticated, show dashboard
  return <Dashboard />;
} 