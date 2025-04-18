import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const CheckProfileButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [rawProfile, setRawProfile] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [planValidation, setPlanValidation] = useState<string>('');
  const { user } = useAuth();
  const supabase = createBrowserClient();
  
  useEffect(() => {
    // Fetch available plans
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('impressions_limit', { ascending: true });
        
        if (error) throw error;
        setAvailablePlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };
    
    fetchPlans();
  }, [supabase]);

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
        
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              const { error } = await supabase
                .from('profiles')
                .update({
                  plan: {
                    name: 'Starter',
                    impressions_limit: 10000,
                    payment_status: 'active',
                    renewal_date: new Date().toISOString()
                  }
                })
                .eq('id', user?.id || '');
              
              if (error) throw error;
              
              await handleCheck();
              setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
              console.error('Error setting Starter plan:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50"
        >
          Set to Starter
        </button>
      </div>
      
      {showResults && rawProfile && (
        <div className="mt-2 bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
          <pre>{JSON.stringify(rawProfile, null, 2)}</pre>
        </div>
      )}
      
      {availablePlans.length > 0 && (
        <div className="mt-4 border-t border-gray-300 pt-2">
          <h4 className="font-semibold mb-1">Available Plans:</h4>
          <ul className="text-xs">
            {availablePlans.map(plan => (
              <li key={plan.id}>
                {plan.name} - {plan.impressions_limit.toLocaleString()} impressions (${plan.price})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {rawProfile?.plan && (
        <div className="mt-4 border-t border-gray-300 pt-2">
          <h4 className="font-semibold mb-1">Plan Validation:</h4>
          <div className="text-xs">
            {typeof rawProfile.plan === 'object' && rawProfile.plan.name ? (
              <span className="text-green-600">✓ Plan format looks valid</span>
            ) : (
              <span className="text-red-600">✗ Plan format appears invalid</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckProfileButton; 