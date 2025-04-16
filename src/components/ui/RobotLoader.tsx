"use client";

import React from 'react';
import "../../app/data/animations/index.css";

interface RobotLoaderProps {
  message?: string;
  theme?: 'light' | 'dark';
}

const RobotLoader = ({ message = "Loading...", theme = 'light' }: RobotLoaderProps) => {
  const bgClass = theme === 'light' ? 'bg-indigo-50' : 'bg-gray-800';
  const textClass = theme === 'light' ? 'text-indigo-800' : 'text-indigo-200';
  const borderClass = theme === 'light' ? 'border-indigo-200' : 'border-indigo-700';
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-lg shadow-sm ${bgClass} border ${borderClass}`}>
      <div className="robot-builder-container mb-4">
        <div className="account-frame"></div>
        <div className="gear gear-1"></div>
        <div className="gear gear-2"></div>
        <div className="robot-left"></div>
        <div className="robot-right"></div>
        <div className="spark spark-1"></div>
        <div className="spark spark-2"></div>
        <div className="spark spark-3"></div>
      </div>
      
      <div className={`text-center mb-2 font-medium ${textClass}`}>
        <div className="robot-text inline-block">{message}</div>
        <span className="robot-indicator ml-2"></span>
      </div>
      
      <div className="w-40 h-1 relative rounded overflow-hidden">
        <div className="absolute inset-0 loading-bar"></div>
      </div>
    </div>
  );
};

export default RobotLoader; 