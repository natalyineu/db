import React from 'react';

interface BriefFormProps {
  formData: {
    platforms: string[];
    target_audience: string;
    location: string;
    start_date: string;
    end_date: string;
    type: string;
    description: string;
    consent: boolean;
    business_name?: string;
  };
  formErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  currentDate: string;
  defaultEndDate: string;
}

const BriefForm: React.FC<BriefFormProps> = ({
  formData,
  formErrors,
  handleChange,
  handleCheckboxChange,
  handleSubmit,
  isSubmitting,
  currentDate,
  defaultEndDate
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="business_name" className="block mb-1 text-sm font-medium">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="business_name"
          name="business_name"
          className={`w-full px-3 py-2 border rounded-md text-base ${formErrors.businessName ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Your business name"
          value={formData.business_name || ''}
          onChange={handleChange}
        />
        {formErrors.businessName && (
          <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.businessName}</p>
        )}
      </div>

      <div>
        <label htmlFor="platforms-0" className="block mb-1 text-sm font-medium">
          Landing Page URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="platforms-0"
          name="platforms[0]"
          className={`w-full px-3 py-2 border rounded-md text-base ${formErrors['platforms[0]'] ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="https://your-landing-page.com"
          value={formData.platforms[0] || ''}
          onChange={handleChange}
        />
        {formErrors['platforms[0]'] && (
          <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors['platforms[0]']}</p>
        )}
      </div>

      <div>
        <label htmlFor="platforms-1" className="block mb-1 text-sm font-medium">
          Creatives Link (optional)
        </label>
        <input
          type="text"
          id="platforms-1"
          name="platforms[1]"
          className={`w-full px-3 py-2 border rounded-md text-base ${(formErrors['platforms[1]'] || formErrors.creativesLink) ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Type 'no' for AI-generated creatives, or add your link"
          value={formData.platforms[1] || ''}
          onChange={handleChange}
        />
        {(formErrors['platforms[1]'] || formErrors.creativesLink) && (
          <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors['platforms[1]'] || formErrors.creativesLink}</p>
        )}
      </div>

      <div>
        <label htmlFor="target_audience" className="block mb-1 text-sm font-medium">
          Target Audience <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="target_audience"
          name="target_audience"
          className={`w-full px-3 py-2 border rounded-md text-base ${formErrors.target_audience ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Example: Women 25-45 interested in fitness"
          value={formData.target_audience}
          onChange={handleChange}
        />
        {formErrors.target_audience && (
          <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.target_audience}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block mb-1 text-sm font-medium">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          className={`w-full px-3 py-2 border rounded-md text-base ${formErrors.location ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Example: United States, Florida"
          value={formData.location}
          onChange={handleChange}
        />
        {formErrors.location && (
          <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block mb-1 text-sm font-medium">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            className={`w-full px-3 py-2 border rounded-md text-base ${formErrors.start_date ? 'border-red-500' : 'border-gray-300'}`}
            min={currentDate}
            value={formData.start_date}
            onChange={handleChange}
          />
          {formErrors.start_date && (
            <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.start_date}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Default is 1-2 days from now</p>
        </div>

        <div>
          <label htmlFor="end_date" className="block mb-1 text-sm font-medium">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            className={`w-full px-3 py-2 border rounded-md text-base ${formErrors.end_date ? 'border-red-500' : 'border-gray-300'}`}
            min={formData.start_date || currentDate}
            value={formData.end_date}
            onChange={handleChange}
          />
          {formErrors.end_date && (
            <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.end_date}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Default flight duration is 30 days</p>
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block mb-1 text-sm font-medium">
          Campaign Goal <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          className={`w-full px-3 py-2 border rounded-md text-base ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
          value={formData.type}
          onChange={handleChange}
        >
          <option value="">Select a goal</option>
          <option value="awareness">Awareness</option>
          <option value="consideration">Consideration</option>
          <option value="conversions">Conversions</option>
        </select>
        {formErrors.type && (
          <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.type}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block mb-1 text-sm font-medium">
          Additional Notes (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
          placeholder="Any specific campaign details or requirements"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="flex items-start">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          className="mt-1 mr-2"
          checked={formData.consent}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="consent" className="text-xs sm:text-sm">
          I agree to AI-Vertise&apos;s <a href="/terms" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
        </label>
      </div>
      {formErrors.consent && (
        <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.consent}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2.5 text-white text-sm font-medium bg-indigo-600 rounded-md hover:bg-indigo-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Brief'}
        </button>
      </div>
    </form>
  );
};

export default BriefForm; 