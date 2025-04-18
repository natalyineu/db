import React, { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const CheckProfileButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [rawProfile, setRawProfile] = useState<any>(null);
  const { user } = useAuth();
  const supabase = createBrowserClient();
  
  const handleCheck = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the raw profile directly from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setRawProfile(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching raw profile:', error);
      setRawProfile({ error: 'Failed to load profile' });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePlan = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the plan field with a properly formatted object
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: {
            name: 'Growth',
            impressions_limit: 50000,
            payment_status: 'active',
            renewal_date: new Date().toISOString()
          }
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Refresh the check
      await handleCheck();
      
      // Reload page after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating plan:', error);
      setRawProfile({ error: 'Failed to update plan' });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-2">
      <div className="flex space-x-2">
        <button
          onClick={handleCheck}
          disabled={isLoading}
          className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Check Raw Profile'}
        </button>
        
        <button
          onClick={handleUpdatePlan}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Fix Plan (Growth)'}
        </button>
      </div>
      
      {showResults && rawProfile && (
        <div className="mt-2 bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
          <pre>{JSON.stringify(rawProfile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CheckProfileButton; 