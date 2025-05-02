import React, { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

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
    setMessage('Refreshing data from Supabase...');
    
    try {
      // Get the current profile data directly from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data && data.plan) {
        // Try direct update of localStorage to fix potential caching issues
        try {
          const storedAuth = localStorage.getItem('supabase.auth.token');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            if (authData.currentSession?.user) {
              // Force reload with a hard refresh
              setMessage('Plan data refreshed, reloading page completely...');
              setTimeout(() => {
                window.location.href = window.location.href;
              }, 1000);
              return;
            }
          }
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        setMessage('Plan data refreshed successfully. Reloading...');
        
        // Force a context refresh 
        await refreshProfile();
        
        // Hard reload the page to clear any cached data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('No plan data found in your Supabase profile');
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      setMessage('Error refreshing profile data from Supabase');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Refreshing Data...' : 'Refresh Subscription Data'}
      </button>
      
      {message && (
        <p className="text-sm mt-2 text-center text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default RefreshPlanButton; 