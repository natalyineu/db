'use client';

import React, { useState, useEffect } from 'react';
import { mockAiInsights } from '@/utils/mock-data';

interface AiInsightsSectionProps {
  isExpanded: boolean;
}

const AiInsightsSection: React.FC<AiInsightsSectionProps> = ({ isExpanded }) => {
  const [insight, setInsight] = useState(mockAiInsights[0]); // Use stable first item for initial render
  
  // Get a random insight on client-side only
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * mockAiInsights.length);
    setInsight(mockAiInsights[randomIndex]);
  }, []);

  return (
    <div className={`
      flex items-center text-xs text-gray-700 dark:text-gray-300 
      transition-all duration-300 ease-in-out 
      ${isExpanded ? 'h-auto opacity-100' : 'h-6 overflow-hidden'}
    `}>
      <div className="flex-shrink-0 w-5 h-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-2">
        <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12H4M12 3V4M20 12H21M12 20V21M18.364 5.63604L17.6569 6.34315M5.63604 5.63604L6.34315 6.34315M6.34315 17.6569L5.63604 18.364M17.6569 17.6569L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="flex-1">
        <span className="font-medium text-indigo-600 dark:text-indigo-400">AI Insight:</span> {insight}
      </p>
    </div>
  );
};

export default AiInsightsSection; 