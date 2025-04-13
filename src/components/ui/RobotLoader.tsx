"use client";

import React, { useState, useEffect } from 'react';
import "../../app/data/loading-animation.css";

interface RobotLoaderProps {
  title?: string;
  subtitle?: string;
  loadingTime?: number;
}

const RobotLoader = ({
  title = "Loading",
  subtitle = "Please wait...",
  loadingTime = 2000,
}: RobotLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const loadingSteps = [
    "Initializing robots",
    "Assembling components",
    "Connecting circuits",
    "Testing systems",
    "Finalizing build"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, loadingTime / 100);

    return () => clearInterval(interval);
  }, [loadingTime]);

  useEffect(() => {
    // Change step based on progress
    const stepInterval = 100 / loadingSteps.length;
    const currentStepIndex = Math.floor(progress / stepInterval);
    setCurrentStep(Math.min(currentStepIndex, loadingSteps.length - 1));
  }, [progress, loadingSteps.length]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F8F9FA]/95 z-50">
      <div className="w-[320px] max-w-full mx-auto enhanced-robot-container rounded-lg p-8 relative bg-white shadow-sm border border-[#DADCE0] will-change-transform">
        {/* Scanning line effect */}
        <div className="robot-scan-line absolute top-0 left-0 will-change-transform"></div>
        
        {/* Decorative panels */}
        <div className="robot-panel top-4 left-4 w-12 h-8 animate-phase-transition delay-300 will-change-transform"></div>
        <div className="robot-panel top-4 right-4 w-16 h-6 animate-phase-transition delay-700 will-change-transform"></div>
        <div className="robot-panel bottom-4 left-4 w-14 h-6 animate-phase-transition delay-500 will-change-transform"></div>
        <div className="robot-panel bottom-4 right-4 w-10 h-8 animate-phase-transition delay-1000 will-change-transform"></div>
        
        {/* Status indicators */}
        <div className="robot-indicator top-6 left-8 animate-blink delay-300 will-change-opacity"></div>
        <div className="robot-indicator top-6 right-8 animate-blink delay-700 will-change-opacity"></div>
        <div className="robot-indicator bottom-6 left-10 animate-blink delay-500 will-change-opacity"></div>
        <div className="robot-indicator bottom-6 right-10 animate-blink delay-1000 will-change-opacity"></div>
        
        {/* Circuit paths */}
        <div className="circuit-path top-10 left-8 w-[80%]"></div>
        <div className="circuit-path bottom-14 left-12 w-[60%]"></div>
        
        {/* Title with glitch effect */}
        <h2 className="text-2xl font-bold text-[#1967D2] mb-3 robot-text animate-glitch duration-2000 text-center will-change-transform">
          {title}
        </h2>
        
        {/* Robot building animation container */}
        <div className="mb-5 flex justify-center items-center">
          <div className="robot-builder-container will-change-transform">
            <div className="account-frame"></div>
            
            {/* Robots working on building */}
            <div className="robot-left will-change-transform">
              <div className="w-2 h-2 bg-yellow-400 absolute top-1 right-1 spark-flash-animation will-change-opacity"></div>
            </div>
            <div className="robot-right will-change-transform">
              <div className="w-2 h-2 bg-yellow-400 absolute top-1 left-1 spark-flash-animation delay-200 will-change-opacity"></div>
            </div>
            
            {/* Gears */}
            <div className="gear gear-1 will-change-transform"></div>
            <div className="gear gear-2 will-change-transform"></div>
            
            {/* Sparks */}
            <div className="spark spark-1 will-change-opacity"></div>
            <div className="spark spark-2 will-change-opacity"></div>
            <div className="spark spark-3 will-change-opacity"></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full progress-bar rounded-full mb-4 overflow-hidden">
          <div 
            className="h-2 bg-[#1967D2] rounded-full will-change-transform" 
            style={{ width: `${progress}%`, transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          ></div>
        </div>
        
        {/* Loading step */}
        <div className="text-center mb-3">
          <p className="text-[#1967D2] robot-text animate-soft-pulse will-change-opacity">
            {loadingSteps[currentStep]}
          </p>
        </div>
        
        {/* Subtitle */}
        <p className="text-sm text-[#5F6368] text-center robot-text">
          {subtitle}
        </p>
        
        {/* Loading percentage */}
        <div className="absolute bottom-2 right-2 text-xs text-[#1967D2] robot-text animate-soft-pulse will-change-opacity">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default RobotLoader; 