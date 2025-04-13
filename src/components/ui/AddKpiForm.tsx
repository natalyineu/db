import { useState, memo } from 'react';
import { KpiService } from '@/services/kpi-service';

interface AddKpiFormProps {
  campaignId: string;
  onKpiAdded: () => void;
}

const AddKpiForm = ({ campaignId, onKpiAdded }: AddKpiFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Form data state
  const [formData, setFormData] = useState({
    budget_plan: 1000,
    budget_fact: 0,
    impressions_plan: 10000,
    impressions_fact: 0,
    clicks_plan: 500,
    clicks_fact: 0,
    reach_plan: 8000,
    reach_fact: 0
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await KpiService.createKpi({
        campaign_id: campaignId,
        date,
        ...formData
      });
      
      // Reset form
      setFormData({
        budget_plan: 1000,
        budget_fact: 0,
        impressions_plan: 10000,
        impressions_fact: 0,
        clicks_plan: 500,
        clicks_fact: 0,
        reach_plan: 8000,
        reach_fact: 0
      });
      
      onKpiAdded();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add KPI data. Please try again.');
      console.error('Error adding KPI data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1967D2] hover:bg-[#185ABC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add KPI Data
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Campaign KPIs</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Budget</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="budget_plan" className="block text-xs text-gray-500">
                      Plan
                    </label>
                    <input
                      type="number"
                      id="budget_plan"
                      name="budget_plan"
                      value={formData.budget_plan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="budget_fact" className="block text-xs text-gray-500">
                      Fact
                    </label>
                    <input
                      type="number"
                      id="budget_fact"
                      name="budget_fact"
                      value={formData.budget_fact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Impressions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="impressions_plan" className="block text-xs text-gray-500">
                      Plan
                    </label>
                    <input
                      type="number"
                      id="impressions_plan"
                      name="impressions_plan"
                      value={formData.impressions_plan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="impressions_fact" className="block text-xs text-gray-500">
                      Fact
                    </label>
                    <input
                      type="number"
                      id="impressions_fact"
                      name="impressions_fact"
                      value={formData.impressions_fact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Clicks</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="clicks_plan" className="block text-xs text-gray-500">
                      Plan
                    </label>
                    <input
                      type="number"
                      id="clicks_plan"
                      name="clicks_plan"
                      value={formData.clicks_plan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="clicks_fact" className="block text-xs text-gray-500">
                      Fact
                    </label>
                    <input
                      type="number"
                      id="clicks_fact"
                      name="clicks_fact"
                      value={formData.clicks_fact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Reach</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="reach_plan" className="block text-xs text-gray-500">
                      Plan
                    </label>
                    <input
                      type="number"
                      id="reach_plan"
                      name="reach_plan"
                      value={formData.reach_plan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="reach_fact" className="block text-xs text-gray-500">
                      Fact
                    </label>
                    <input
                      type="number"
                      id="reach_fact"
                      name="reach_fact"
                      value={formData.reach_fact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1967D2] hover:bg-[#185ABC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save KPI Data'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default memo(AddKpiForm); 