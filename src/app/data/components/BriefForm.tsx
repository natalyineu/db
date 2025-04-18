import React, { useState } from 'react';

interface BriefFormProps {
  formData: {
    platforms: string[];
    target_audience: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
    consent: boolean;
    business_name?: string;
  };
  formErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  currentDate?: string;
  defaultEndDate?: string;
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  
  // Calculate form completion percentage
  const requiredFields = ['platforms[0]', 'location', 'consent'];
  const filledRequiredFields = requiredFields.filter(field => {
    if (field === 'platforms[0]') return formData.platforms[0];
    if (field === 'consent') return formData.consent;
    return formData[field as keyof typeof formData];
  });
  
  const completionPercentage = Math.round((filledRequiredFields.length / requiredFields.length) * 100);
  
  const tooltips = {
    'business_name': 'We use your business name to personalize your campaign materials.',
    'platforms[0]': 'This is where customers will land after clicking your ad.',
    'platforms[1]': 'Upload your own creative assets or let our AI create them for you.',
    'target_audience': 'Be specific about demographics, interests, and behaviors of your ideal customers.',
    'location': 'Specify countries, states, or cities where you want your ads to appear.',
    'start_date': 'When should your campaign begin? We recommend allowing at least 1-2 days for setup.',
    'end_date': 'When should your campaign end? A 30-day run typically provides the best data for optimization.',
    'description': 'Tell us any specific needs, goals, or campaign details.',
  };

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Campaign Brief</h3>
          <span className="text-sm font-medium text-indigo-700">{completionPercentage}% Complete</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
            style={{width: `${completionPercentage}%`}}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="business_name" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              Business Name
              <button 
                type="button"
                className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                onMouseEnter={() => setHoveredTooltip('business_name')}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {hoveredTooltip === 'business_name' && (
                <div className="absolute z-10 top-0 left-32 w-60 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltips['business_name']}
                </div>
              )}
            </label>
            <input
              type="text"
              id="business_name"
              name="business_name"
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                focusedField === 'business_name' ? 'border-indigo-500' : 
                formErrors.businessName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your business name"
              value={formData.business_name || ''}
              onChange={handleChange}
              onFocus={() => setFocusedField('business_name')}
              onBlur={() => setFocusedField(null)}
            />
            {formErrors.businessName && (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.businessName}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="platforms-0" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              Landing Page URL <span className="text-red-500 ml-0.5">*</span>
              <button 
                type="button"
                className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                onMouseEnter={() => setHoveredTooltip('platforms[0]')}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {hoveredTooltip === 'platforms[0]' && (
                <div className="absolute z-10 top-0 left-44 w-60 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltips['platforms[0]']}
                </div>
              )}
            </label>
            <input
              type="text"
              id="platforms-0"
              name="platforms[0]"
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                focusedField === 'platforms[0]' ? 'border-indigo-500' : 
                formErrors['platforms[0]'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., https://your-site.com"
              value={formData.platforms[0] || ''}
              onChange={handleChange}
              onFocus={() => setFocusedField('platforms[0]')}
              onBlur={() => setFocusedField(null)}
            />
            {formErrors['platforms[0]'] ? (
              <p className="mt-1.5 text-sm text-red-600">{formErrors['platforms[0]']}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Where your customers will go after clicking your ad</p>
            )}
          </div>
        </div>

        <div className="relative">
          <label htmlFor="platforms-1" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
            Creatives Link
            <button 
              type="button"
              className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
              onMouseEnter={() => setHoveredTooltip('platforms[1]')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {hoveredTooltip === 'platforms[1]' && (
              <div className="absolute z-10 top-0 left-36 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                {tooltips['platforms[1]']}
              </div>
            )}
          </label>
          <input
            type="text"
            id="platforms-1"
            name="platforms[1]"
            className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
              focusedField === 'platforms[1]' ? 'border-indigo-500' : 
              (formErrors['platforms[1]'] || formErrors.creativesLink) ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Type 'no' for AI-generated creatives, or add your link"
            value={formData.platforms[1] || ''}
            onChange={handleChange}
            onFocus={() => setFocusedField('platforms[1]')}
            onBlur={() => setFocusedField(null)}
          />
          {(formErrors['platforms[1]'] || formErrors.creativesLink) ? (
            <p className="mt-1.5 text-sm text-red-600">{formErrors['platforms[1]'] || formErrors.creativesLink}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Leave empty or type "no" to have our AI create your ads</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="target_audience" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              Target Audience
              <button 
                type="button"
                className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                onMouseEnter={() => setHoveredTooltip('target_audience')}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {hoveredTooltip === 'target_audience' && (
                <div className="absolute z-10 top-0 left-40 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltips['target_audience']}
                </div>
              )}
            </label>
            <input
              type="text"
              id="target_audience"
              name="target_audience"
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                focusedField === 'target_audience' ? 'border-indigo-500' : 
                formErrors.target_audience ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Example: Women 25-45 interested in fitness"
              value={formData.target_audience}
              onChange={handleChange}
              onFocus={() => setFocusedField('target_audience')}
              onBlur={() => setFocusedField(null)}
            />
            {formErrors.target_audience ? (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.target_audience}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Who should see your ads? Be specific for better results</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              Location <span className="text-red-500 ml-0.5">*</span>
              <button 
                type="button"
                className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                onMouseEnter={() => setHoveredTooltip('location')}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {hoveredTooltip === 'location' && (
                <div className="absolute z-10 top-0 left-30 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltips['location']}
                </div>
              )}
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                focusedField === 'location' ? 'border-indigo-500' : 
                formErrors.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Example: United States, Florida"
              value={formData.location}
              onChange={handleChange}
              onFocus={() => setFocusedField('location')}
              onBlur={() => setFocusedField(null)}
            />
            {formErrors.location ? (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.location}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Where would you like your ads to be shown?</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="start_date" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              Start Date
              <button 
                type="button"
                className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                onMouseEnter={() => setHoveredTooltip('start_date')}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {hoveredTooltip === 'start_date' && (
                <div className="absolute z-10 top-0 left-30 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltips['start_date']}
                </div>
              )}
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                focusedField === 'start_date' ? 'border-indigo-500' : 
                formErrors.start_date ? 'border-red-500' : 'border-gray-300'
              }`}
              min={currentDate}
              value={formData.start_date}
              onChange={handleChange}
              onFocus={() => setFocusedField('start_date')}
              onBlur={() => setFocusedField(null)}
            />
            {formErrors.start_date ? (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.start_date}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Campaigns typically start 1-2 business days after approval</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="end_date" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
              End Date
              <button 
                type="button"
                className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                onMouseEnter={() => setHoveredTooltip('end_date')}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {hoveredTooltip === 'end_date' && (
                <div className="absolute z-10 top-0 left-28 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                  {tooltips['end_date']}
                </div>
              )}
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                focusedField === 'end_date' ? 'border-indigo-500' : 
                formErrors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
              min={formData.start_date || currentDate}
              value={formData.end_date}
              onChange={handleChange}
              onFocus={() => setFocusedField('end_date')}
              onBlur={() => setFocusedField(null)}
            />
            {formErrors.end_date ? (
              <p className="mt-1.5 text-sm text-red-600">{formErrors.end_date}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">Recommend 30+ days for optimal performance</p>
            )}
          </div>
        </div>

        <div className="relative">
          <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 flex items-center">
            Campaign Goals and Details
            <button 
              type="button"
              className="ml-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
              onMouseEnter={() => setHoveredTooltip('description')}
              onMouseLeave={() => setHoveredTooltip(null)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {hoveredTooltip === 'description' && (
              <div className="absolute z-10 top-0 left-52 w-64 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                {tooltips['description']}
              </div>
            )}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
              focusedField === 'description' ? 'border-indigo-500' : 'border-gray-300'
            }`}
            placeholder="Tell us what you're trying to achieve with this campaign. More sales? Brand awareness? Website visits?"
            value={formData.description}
            onChange={handleChange}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
          ></textarea>
          <p className="mt-1 text-xs text-gray-500">The more details you provide, the better we can optimize your campaign</p>
        </div>

        <div className="flex items-start px-4 py-4 rounded-lg bg-gray-50 border border-gray-100">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={formData.consent}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="consent" className="ml-3 text-sm text-gray-700">
            I agree to AI-Vertise&apos;s <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
          </label>
        </div>
        {formErrors.consent && (
          <p className="mt-1 text-sm text-red-600">{formErrors.consent}</p>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 text-white text-sm font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'ai-vertise-gradient-bg hover:shadow-md'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                Submit Brief
                <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BriefForm; 