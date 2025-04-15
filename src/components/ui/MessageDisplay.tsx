'use client';

import React from 'react';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export type MessageAction = {
  label: string;
  onClick: () => void;
  primary?: boolean;
};

export interface MessageProps {
  type?: MessageType;
  title?: string;
  message: string | null;
  subMessage?: string;
  actions?: MessageAction[];
  className?: string;
  icon?: React.ReactNode;
}

export default function MessageDisplay({ 
  type = 'info', 
  title, 
  message, 
  subMessage, 
  actions = [],
  className = '',
  icon
}: MessageProps) {
  if (!message) {
    return null;
  }
  
  const typeClasses = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
  };

  const iconMap = {
    success: (
      <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  };

  const displayIcon = icon || iconMap[type];
  
  return (
    <div className={`p-4 border rounded-md ${typeClasses[type]} ${className}`}>
      <div className="flex items-start">
        {displayIcon && (
          <div className="flex-shrink-0 mr-3">
            {displayIcon}
          </div>
        )}
        
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{message}</div>
          {subMessage && <div className="text-xs mt-1 opacity-80">{subMessage}</div>}
          
          {actions.length > 0 && (
            <div className="mt-3 flex space-x-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    action.primary 
                      ? `bg-${type.split('-')[0]}-100 dark:bg-${type.split('-')[0]}-800/30 text-${type.split('-')[0]}-800 dark:text-${type.split('-')[0]}-300 hover:bg-${type.split('-')[0]}-200 dark:hover:bg-${type.split('-')[0]}-800/50` 
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 