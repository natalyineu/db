'use client';

import { useState } from 'react';
import { Campaign } from '@/types';
import CampaignStatusBadge from './CampaignStatusBadge';
import CampaignIcon from './CampaignIcon';

interface CampaignItemProps {
  campaign: Campaign;
  onUpdate?: () => void;
  showEditButton?: boolean;
}

const CampaignItem = ({ campaign, onUpdate, showEditButton = false }: CampaignItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Calculate AI insights
  const getAiInsight = () => {
    // This would typically come from actual AI analysis
    const insights = [
      "Engagement is 32% above average for this segment",
      "Recommended 15% budget increase for optimal ROI",
      "Audience segment B is underperforming, consider revising",
      "Creative assets performing 28% better on mobile",
      "Conversion rate improved 18% with latest optimization"
    ];
    
    // Return a random insight for demo purposes
    return insights[Math.floor(Math.random() * insights.length)];
  };
  
  // Calculate performance score (0-100)
  const getPerformanceScore = () => {
    // This would typically be calculated based on real metrics
    return Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  };
  
  const performanceScore = getPerformanceScore();
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    return "text-yellow-500";
  };
  
  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-app-sm hover:shadow-app transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Performance indicator bar */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gray-100 dark:bg-gray-700">
        <div 
          className={`h-full ${
            performanceScore >= 85 
              ? 'bg-green-500' 
              : performanceScore >= 70 
                ? 'bg-blue-500' 
                : 'bg-yellow-500'
          } transition-all duration-500`}
          style={{ width: `${performanceScore}%` }}
        ></div>
      </div>
      
      {/* Card content */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`
            ${isHovered ? 'scale-110' : 'scale-100'} 
            transition-transform duration-300
          `}>
            <CampaignIcon type={campaign.type} className="w-10 h-10" />
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {campaign.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {formatDate(campaign.created_at)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`
                  flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${getScoreColorClass(performanceScore)} bg-gray-50 dark:bg-gray-700
                `}>
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {performanceScore}
                </div>
                <CampaignStatusBadge status={campaign.status} />
              </div>
            </div>
            
            {/* Campaign metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Budget', value: formatCurrency(campaign.budget) },
                { label: 'Spent', value: formatCurrency(campaign.spent || 0) },
                { 
                  label: 'ROAS', 
                  value: campaign.roas ? `${campaign.roas.toFixed(1)}x` : 'N/A',
                  highlight: campaign.roas && campaign.roas > 2
                }
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                  <p className={`text-sm font-semibold ${metric.highlight ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
            
            {/* AI Insight */}
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
                <span className="font-medium text-indigo-600 dark:text-indigo-400">AI Insight:</span> {getAiInsight()}
              </p>
            </div>
            
            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
              >
                <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                <svg 
                  className={`ml-1 w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                {showEditButton && (
                  <button 
                    className="text-xs px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                )}
                <button 
                  className="text-xs px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Performance Details</h4>
            
            {/* Performance metrics */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Clicks', value: '12,432', change: '+24%' },
                { label: 'Impressions', value: '342K', change: '+17%' },
                { label: 'CTR', value: '3.64%', change: '+0.8%' },
                { label: 'Conv. Rate', value: '4.2%', change: '+1.1%' },
              ].map((metric, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</p>
                  <div className="flex items-baseline">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                    <span className="ml-1 text-xs text-green-500">{metric.change}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* AI Recommendations */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2">AI Recommendations</h5>
              <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
                <li className="flex items-start">
                  <svg className="w-3 h-3 mt-0.5 mr-2 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Increase budget by 15% to capitalize on high-performing keywords
                </li>
                <li className="flex items-start">
                  <svg className="w-3 h-3 mt-0.5 mr-2 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Shift 10% of budget from desktop to mobile placements
                </li>
                <li className="flex items-start">
                  <svg className="w-3 h-3 mt-0.5 mr-2 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add 3 new negative keywords to reduce wasted spend
                </li>
              </ul>
            </div>
            
            {/* Actions bar */}
            <div className="flex justify-end gap-2 mt-3">
              <button className="text-xs px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                Apply AI Recommendations
              </button>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                View Full Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignItem; 