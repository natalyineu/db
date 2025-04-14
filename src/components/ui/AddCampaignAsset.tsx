'use client';

import { useState } from 'react';
import { CampaignService } from '@/services/campaign-service';

type AddCampaignAssetProps = {
  campaignId: string;
  onAssetAdded: () => void;
};

export default function AddCampaignAsset({ campaignId, onAssetAdded }: AddCampaignAssetProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [url, setUrl] = useState('https://google.com');
  const [driveLink, setDriveLink] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      await CampaignService.addCampaignAsset({
        campaign_id: campaignId,
        url,
        drive_link: driveLink || undefined,
        notes: notes || undefined
      });
      
      // Reset and close form
      setUrl('https://google.com');
      setDriveLink('');
      setNotes('');
      setShowForm(false);
      onAssetAdded();
    } catch (err) {
      setError('Failed to add asset. Please try again.');
      console.error('Error adding campaign asset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <svg className="mr-2 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Asset
        </button>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-3">
          <form onSubmit={handleSubmit}>
            <h4 className="text-sm font-medium text-gray-800 mb-3">Add Campaign Asset</h4>
            
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                {error}
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="assetUrl" className="block text-xs font-medium text-gray-700 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="assetUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-1 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://google.com"
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="assetDriveLink" className="block text-xs font-medium text-gray-700 mb-1">
                Google Drive Link (Optional)
              </label>
              <input
                type="text"
                id="assetDriveLink"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full px-3 py-1 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://drive.google.com/..."
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="assetNotes" className="block text-xs font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="assetNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1 text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add any additional information..."
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Asset'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 