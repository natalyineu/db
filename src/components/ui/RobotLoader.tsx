"use client";

import React from 'react';

interface RobotLoaderProps {
  title?: string;
  subtitle?: string;
  message?: string;
  showRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

const RobotLoader: React.FC<RobotLoaderProps> = ({
  title = "Loading",
  subtitle = "Our robots are working on it",
  message = "Verifying your account",
  showRetry = false,
  retryCount = 0,
  maxRetries = 3
}) => {
  return (
    <div className="w-full max-w-md p-8">
      {/* Robot builder animation */}
      <div className="robot-builder-container mb-8">
        {/* Account frame being built */}
        <div className="account-frame"></div>
        
        {/* Gears */}
        <div className="gear gear-1"></div>
        <div className="gear gear-2"></div>
        
        {/* Robots */}
        <div className="robot-left"></div>
        <div className="robot-right"></div>
        
        {/* Sparks */}
        <div className="spark spark-1"></div>
        <div className="spark spark-2"></div>
        <div className="spark spark-3"></div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-indigo-700 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        
        <div className="mt-4 flex items-center justify-center">
          <div className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 
                  pulse-border-animation flex items-center">
            <span>{message}</span>
            <span className="ml-1 inline-flex">
              <span className="animate-bounce mx-0.5">.</span>
              <span className="animate-bounce mx-0.5 delay-100">.</span>
              <span className="animate-bounce mx-0.5 delay-200">.</span>
            </span>
          </div>
        </div>
        
        {showRetry && retryCount > 0 && (
          <p className="mt-4 text-sm text-gray-500">Attempt {retryCount}/{maxRetries}</p>
        )}
      </div>
    </div>
  );
};

export default RobotLoader; 