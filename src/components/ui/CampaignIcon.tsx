import React from 'react';
import { CampaignType } from '@/types';

interface CampaignIconProps {
  type: CampaignType;
  className?: string;
}

const CampaignIcon = ({ type, className = "w-10 h-10" }: CampaignIconProps) => {
  // Define styling based on campaign type
  const getIconStyles = (): { bg: string; text: string; icon: React.ReactNode } => {
    switch (type) {
      case 'awareness':
        return {
          bg: "bg-pink-50 dark:bg-pink-900/30",
          text: "text-pink-600 dark:text-pink-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        };
      case 'consideration':
        return {
          bg: "bg-indigo-50 dark:bg-indigo-900/30",
          text: "text-indigo-600 dark:text-indigo-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )
        };
      case 'conversion':
        return {
          bg: "bg-purple-50 dark:bg-purple-900/30",
          text: "text-purple-600 dark:text-purple-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          )
        };
    }
  };
  
  const { bg, text, icon } = getIconStyles();
  
  return (
    <div className={`${className} flex-shrink-0 rounded-full ${bg} flex items-center justify-center ${text}`}>
      {icon}
    </div>
  );
};

export default CampaignIcon; 