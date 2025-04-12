"use client";

import React from 'react';

interface ErrorDisplayProps {
  message: string;
  subMessage?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backText?: string;
  retryText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  subMessage,
  onRetry,
  onBack,
  backText = 'Back',
  retryText = 'Retry'
}) => {
  return (
    <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">{message}</p>
        {subMessage && (
          <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
        )}
      </div>
      <div className="flex justify-center space-x-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {retryText}
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {backText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay; 