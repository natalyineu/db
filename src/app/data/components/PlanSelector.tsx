import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PlanService } from '@/services/plan-service';

interface PlanSelectorProps {
  currentPlan?: string;
  onPlanUpdate?: (newPlan: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ 
  currentPlan = 'Starter', 
  onPlanUpdate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan);
  const { user, refreshProfile } = useAuth();
  
  // Load available plans
  useEffect(() => {
    async function loadPlans() {
      const availablePlans = await PlanService.getAvailablePlans();
      setPlans(availablePlans);
    }
    
    loadPlans();
  }, []);
  
  // Update selected plan when current plan prop changes
  useEffect(() => {
    setSelectedPlan(currentPlan);
  }, [currentPlan]);
  
  const handlePlanChange = async () => {
    if (!user) {
      setMessage('You must be logged in to update your plan');
      return;
    }
    
    if (selectedPlan === currentPlan) {
      setMessage('Already on this plan');
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    setIsUpdating(true);
    setMessage('Updating your plan...');
    
    try {
      const success = await PlanService.updatePlan(user.id, selectedPlan);
      
      if (success) {
        setMessage('Plan updated successfully!');
        
        // Call the callback if provided
        if (onPlanUpdate) {
          onPlanUpdate(selectedPlan);
        }
        
        // Refresh the profile to get the latest plan data
        await refreshProfile();
        
        // Clear message after a delay
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Failed to update plan. Please try again.');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      setMessage('An error occurred while updating your plan');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Select your plan:</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Standard plans */}
        <button
          type="button"
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedPlan === 'Starter' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPlan('Starter')}
        >
          Starter
        </button>
        
        <button
          type="button"
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedPlan === 'Growth' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPlan('Growth')}
        >
          Growth
        </button>
        
        <button
          type="button"
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedPlan === 'Enterprise' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
          onClick={() => setSelectedPlan('Enterprise')}
        >
          Enterprise
        </button>
        
        {/* Dynamic plans from database */}
        {plans.map(plan => (
          plan.name !== 'Starter' && 
          plan.name !== 'Growth' && 
          plan.name !== 'Enterprise' && (
            <button
              key={plan.id}
              type="button"
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedPlan === plan.name 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              {plan.name}
            </button>
          )
        ))}
      </div>
      
      <button
        type="button"
        disabled={isUpdating || selectedPlan === currentPlan}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePlanChange}
      >
        {isUpdating ? 'Updating...' : 'Update Plan'}
      </button>
      
      {message && (
        <p className={`mt-2 text-sm ${
          message.includes('success') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PlanSelector; 