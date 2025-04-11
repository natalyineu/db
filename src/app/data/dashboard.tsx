"use client";

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { profile, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-gray-600">Unable to load profile data</p>
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
        
        <div className="mt-8 space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-medium text-gray-900">User Information</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <span className="text-sm text-gray-900">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Account Created:</span>
                <span className="text-sm text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
              {profile.updated_at && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
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