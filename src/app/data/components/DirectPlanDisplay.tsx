import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

const DirectPlanDisplay: React.FC = () => {
  const [plan, setPlan] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createBrowserClient();
  
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        setPlan('Not logged in');
        setIsLoading(false);
        return;
      }
      
      try {
        // Direct query to database for just the plan column
        const { data, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching plan:', error);
          setPlan('Error');
        } else if (data && data.plan) {
          console.log('Plan directly fetched:', data.plan);
          setPlan(data.plan);
        } else {
          console.log('No plan found in database');
          setPlan('Free');
        }
      } catch (error) {
        console.error('Error in plan fetch:', error);
        setPlan('Error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, [user, supabase]);
  
  return (
    <div className="text-xl font-semibold text-gray-800">
      {isLoading ? 'Loading...' : plan}
    </div>
  );
};

export default DirectPlanDisplay; 