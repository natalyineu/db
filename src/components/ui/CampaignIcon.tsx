import React from 'react';

interface CampaignIconProps {
  name: string;
}

const CampaignIcon = ({ name }: CampaignIconProps) => {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes('social') || lowercaseName.includes('facebook') || lowercaseName.includes('instagram')) {
    return (
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#E8F0FE] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#1967D2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>
    );
  } else if (lowercaseName.includes('email') || lowercaseName.includes('newsletter')) {
    return (
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#FEF7E0] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#B06000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    );
  } else if (lowercaseName.includes('ads') || lowercaseName.includes('google') || lowercaseName.includes('display')) {
    return (
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#E6F4EA] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#137333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      </div>
    );
  } else {
    return (
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#F1F3F4] flex items-center justify-center">
        <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      </div>
    );
  }
};

export default CampaignIcon; 