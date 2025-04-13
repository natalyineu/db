import React, { useState, useEffect } from 'react';
import { Campaign, CampaignStatus } from '@/types';
import { Button } from '@/features/shared/ui/Button';
import { Card } from '@/features/shared/ui/Card';

interface CampaignFormProps {
  campaign?: Partial<Campaign>;
  isLoading?: boolean;
  onSubmit: (campaign: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
  campaign = {},
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    status: 'draft' as CampaignStatus,
    start_date: '',
    end_date: '',
    ...campaign,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Update form when campaign prop changes
  useEffect(() => {
    setFormData({
      name: '',
      status: 'draft' as CampaignStatus,
      start_date: '',
      end_date: '',
      ...campaign,
    });
  }, [campaign]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        form: 'Failed to save campaign. Please try again.',
      }));
    } finally {
      setSubmitLoading(false);
    }
  };

  // If component is in loading state
  if (isLoading) {
    return (
      <Card isLoading={true} className="p-6">
        <div />
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {campaign.id ? 'Edit Campaign' : 'Create New Campaign'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {campaign.id 
                ? 'Update your campaign information below'
                : 'Fill out the form below to create a new campaign'}
            </p>
          </div>

          {/* Form error message */}
          {errors.form && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.form}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Campaign Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Campaign Name*
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
              </div>
            </div>

            {/* Campaign Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'draft'}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  value={formData.start_date || ''}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  value={formData.end_date || ''}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.end_date ? 'border-red-300' : ''
                  }`}
                />
                {errors.end_date && <p className="mt-2 text-sm text-red-600">{errors.end_date}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitLoading}
            isLoading={submitLoading}
          >
            {campaign.id ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default CampaignForm; 