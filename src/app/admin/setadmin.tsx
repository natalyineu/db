'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function SetAdminPage() {
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  
  const supabase = createBrowserClient();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (user) {
      setUserEmail(user.email || '');
      
      // Check current admin status
      checkAdminStatus();
    }
  }, [user]);
  
  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      const userRole = data.user?.app_metadata?.role;
      setAdminStatus(userRole === 'admin');
      
      setMessage(`Current role: ${userRole || 'none'}`);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setMessage('Error checking admin status');
    }
  };
  
  const setAdminRole = async () => {
    if (!user) {
      setMessage('You must be logged in');
      return;
    }
    
    setIsProcessing(true);
    setMessage('Processing...');
    
    try {
      // Use RPC function to set admin role
      const { data, error } = await supabase.rpc('set_admin_role', {
        user_id: user.id
      });
      
      if (error) throw error;
      
      setMessage('Admin role set successfully! Please refresh the page or log out and log back in.');
      setAdminStatus(true);
    } catch (error) {
      console.error('Error setting admin role:', error);
      
      // Fall back to a client-side message if RPC fails
      setMessage('Could not set admin role via RPC. Please run this SQL query in Supabase dashboard:\n\nUPDATE auth.users SET raw_app_meta_data = jsonb_set(raw_app_meta_data, \'{role}\', \'"admin"\') WHERE id = \'' + user.id + '\';');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in first</div>;
  }
  
  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Admin Role Utility</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-md">
        <p className="mb-2"><strong>User:</strong> {userEmail}</p>
        <p className="mb-2"><strong>ID:</strong> {user?.id}</p>
        <p className="mb-2">
          <strong>Admin Status:</strong>{' '}
          {adminStatus === null ? 'Checking...' : adminStatus ? 'Yes' : 'No'}
        </p>
      </div>
      
      <button
        onClick={setAdminRole}
        disabled={isProcessing || adminStatus === true}
        className={`w-full py-2 px-4 rounded-md ${
          adminStatus ? 'bg-green-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-medium mb-4`}
      >
        {adminStatus ? 'Already Admin' : isProcessing ? 'Processing...' : 'Set Admin Role'}
      </button>
      
      {message && (
        <div className="p-4 border rounded-md whitespace-pre-wrap">
          {message}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-md text-sm">
        <p className="font-medium mb-2">Instructions:</p>
        <ol className="list-decimal pl-4 space-y-2">
          <li>Use this utility to set your account as an admin</li>
          <li>If the automatic method doesn't work, you'll need to run the SQL query in Supabase</li>
          <li>After setting admin role, log out and log back in</li>
          <li>You should now have access to the admin pages at /admin/users, /admin/plans, etc.</li>
        </ol>
      </div>
    </div>
  );
} 