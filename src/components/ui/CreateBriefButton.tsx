'use client';

import { useState } from 'react';
import { BriefService } from '@/services/brief-service';
import type { BriefStatus, GoalType } from '@/types';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * This component replaces the previous CreateCampaignButton.
 */

type CreateBriefProps = {
  userId: string;
  onBriefCreated: () => void;
};

export default function CreateBriefButton({ userId, onBriefCreated }: CreateBriefProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<BriefStatus>('draft');
  const [goal, setGoal] = useState<GoalType>('Awareness');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Brief name is required');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await BriefService.createBrief({
        name,
        status,
        goal,
        user_id: userId
      });
      
      // Reset and close form
      setName('');
      setStatus('draft');
      setGoal('Awareness');
      setShowForm(false);
      onBriefCreated();
    } catch (err) {
      setError('Failed to create brief. Please try again.');
      console.error('Error creating brief:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-3 border border-transparent rounded-md shadow-md text-sm font-medium text-white ai-vertise-gradient-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Brief
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Brief</h3>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="briefName" className="block text-sm font-medium text-gray-700 mb-1">
                Brief Name
              </label>
              <input
                type="text"
                id="briefName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter brief name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="briefStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="briefStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as BriefStatus)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="briefGoal" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Goal
              </label>
              <select
                id="briefGoal"
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
                className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Awareness">Awareness</option>
                <option value="Consideration">Consideration</option>
                <option value="Conversions">Conversions</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ai-vertise-gradient-bg hover:opacity-95 focus:outline-none disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Brief'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 