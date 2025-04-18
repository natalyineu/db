import React, { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const RefreshPlanButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { user, refreshProfile } = useAuth();
  const supabase = createBrowserClient();
  
  const handleRefresh = async () => {
    if (!user) {
      setMessage('User not logged in');
      return;
    }
    
    setIsLoading(true);
    setMessage('Refreshing profile data...');
    
    try {
      // First, get the current profile data directly from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched profile from database:', data);
      
      // Force a refresh of the profile in the auth context
      await refreshProfile();
      
      setMessage('Profile refreshed successfully');
      
      // Reload the page to ensure all components re-render
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setMessage('Error refreshing profile data');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Refreshing...' : 'Refresh Plan Data'}
      </button>
      
      {message && (
        <p className="text-sm mt-2 text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default RefreshPlanButton; 