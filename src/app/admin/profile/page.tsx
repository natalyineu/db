'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  
  const supabase = createBrowserClient();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        const userRole = data.user?.app_metadata?.role;
        const isUserAdmin = userRole === 'admin';
        
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          router.push('/data');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }

    checkAdminStatus();
  }, [isAuthenticated, user, router, supabase]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        // Initialize form fields
        setName(data.name || '');
        setCompanyName(data.company_name || '');
        setPhone(data.phone || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin && user?.id) {
      fetchProfile();
    }
  }, [isAdmin, user, supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          company_name: companyName,
          phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully');
      
      // Refresh profile data
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Not authorized. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <button
          onClick={() => router.push('/admin/campaigns')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Campaigns
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-900 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-900 rounded-md">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading profile...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-md">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-md">Administrator</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created On</p>
                <p className="text-md">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleUpdateProfile}>
            <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 