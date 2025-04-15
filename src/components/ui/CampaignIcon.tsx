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
      case 'social':
        return {
          bg: "bg-indigo-50 dark:bg-indigo-900/30",
          text: "text-indigo-600 dark:text-indigo-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          )
        };
      case 'email':
        return {
          bg: "bg-amber-50 dark:bg-amber-900/30",
          text: "text-amber-600 dark:text-amber-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        };
      case 'display':
        return {
          bg: "bg-blue-50 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        };
      case 'search':
        return {
          bg: "bg-green-50 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        };
      case 'video':
        return {
          bg: "bg-red-50 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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