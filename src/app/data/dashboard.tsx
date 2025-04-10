"use client";

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/client-provider';
import { UserProfile } from '@/types';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the current authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          throw new Error(authError?.message || 'No authenticated user found');
        }
        
        // Fetch user profile data from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profileError) {
          // Handle the case where the profile is missing
          // This is unlikely to happen since we create profiles at login now
          console.error('Profile fetch error:', profileError);
          
          // Fetch latest session data
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            throw new Error('No valid session. Please log in again.');
          }
          
          // Trigger profile creation via API
          const response = await fetch('/api/ensure-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create profile: ${errorData.error || 'Unknown error'}`);
          }
          
          // Fetch the profile again after creation
          const { data: newProfileData, error: newProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (newProfileError) {
            throw new Error(`Error fetching new profile: ${newProfileError.message}`);
          }
          
          // Cast with proper type handling
          if (newProfileData && 
              typeof newProfileData.id === 'string' && 
              typeof newProfileData.email === 'string' && 
              typeof newProfileData.created_at === 'string') {
            setUser({
              id: newProfileData.id,
              email: newProfileData.email,
              created_at: newProfileData.created_at,
              updated_at: newProfileData.updated_at as string | undefined
            });
          }
        } else if (profileData) {
          // Cast with proper type handling
          if (typeof profileData.id === 'string' && 
              typeof profileData.email === 'string' && 
              typeof profileData.created_at === 'string') {
            setUser({
              id: profileData.id,
              email: profileData.email,
              created_at: profileData.created_at,
              updated_at: profileData.updated_at as string | undefined
            });
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Personal Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your account</p>
        </div>
        
        {user && (
          <div className="mt-8 space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium text-gray-900">User Information</h2>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Account Created:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                {user.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
} 