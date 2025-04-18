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
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  
  useEffect(() => {
    // Fetch available plans
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*');
        
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
      // Update with just the plan name as a string
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: "Growth"
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
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
  
  // Update the "Set to Starter" button
  const setToStarter = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          plan: "Starter"
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
  };
  
  // Add this function to check schema
  const checkSchema = async () => {
    setIsLoading(true);
    try {
      // This query will get column information for the plans table
      const { data, error } = await supabase.rpc(
        'get_table_columns',
        { table_name: 'plans' }
      );
      
      if (error) {
        // If the stored procedure doesn't exist, try a direct query
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'plans')
          .eq('table_schema', 'public');
          
        if (columnsError) throw columnsError;
        setSchemaInfo(columns);
      } else {
        setSchemaInfo(data);
      }
    } catch (error) {
      console.error('Error checking schema:', error);
      setSchemaInfo({ error: 'Failed to check schema' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex space-x-2 flex-wrap">
        <button
          onClick={handleCheck}
          disabled={isLoading}
          className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50 mb-1"
        >
          {isLoading ? 'Loading...' : 'Check Raw Profile'}
        </button>
        
        <button
          onClick={handleUpdatePlan}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50 mb-1"
        >
          {isLoading ? 'Updating...' : 'Fix Plan (Growth)'}
        </button>
        
        <button
          onClick={setToStarter}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50 mb-1"
        >
          Set to Starter
        </button>
        
        <button
          onClick={checkSchema}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50 mb-1"
        >
          Check DB Schema
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
                {plan.name} {plan.price !== undefined ? `($${plan.price})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {rawProfile?.plan && (
        <div className="mt-4 border-t border-gray-300 pt-2">
          <h4 className="font-semibold mb-1">Plan Validation:</h4>
          <div className="text-xs">
            {typeof rawProfile.plan === 'string' ? (
              <span className="text-green-600">✓ Plan is string: "{rawProfile.plan}"</span>
            ) : typeof rawProfile.plan === 'object' && rawProfile.plan.name ? (
              <span className="text-green-600">✓ Plan is object with name: "{rawProfile.plan.name}"</span>
            ) : (
              <span className="text-red-600">✗ Plan format appears invalid: {JSON.stringify(rawProfile.plan)}</span>
            )}
          </div>
        </div>
      )}
      
      {schemaInfo && (
        <div className="mt-2 bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
          <h4 className="font-semibold mb-1">Plans Table Schema:</h4>
          <pre>{JSON.stringify(schemaInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CheckProfileButton; 