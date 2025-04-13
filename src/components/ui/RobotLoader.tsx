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
  loadingTime = 3000,
}: RobotLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const loadingSteps = [
    "Initializing system",
    "Preparing your account",
    "Verifying credentials",
    "Loading resources",
    "Almost there"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
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
      <div className="w-[320px] max-w-full mx-auto enhanced-robot-container rounded-lg p-8 relative bg-white shadow-sm border border-[#DADCE0]">
        {/* Scanning line effect */}
        <div className="robot-scan-line absolute top-0 left-0"></div>
        
        {/* Decorative panels */}
        <div className="robot-panel top-4 left-4 w-12 h-8 animate-phase-transition delay-300"></div>
        <div className="robot-panel top-4 right-4 w-16 h-6 animate-phase-transition delay-700"></div>
        <div className="robot-panel bottom-4 left-4 w-14 h-6 animate-phase-transition delay-500"></div>
        <div className="robot-panel bottom-4 right-4 w-10 h-8 animate-phase-transition delay-1000"></div>
        
        {/* Status indicators */}
        <div className="robot-indicator top-6 left-8 animate-blink delay-300"></div>
        <div className="robot-indicator top-6 right-8 animate-blink delay-700"></div>
        <div className="robot-indicator bottom-6 left-10 animate-blink delay-500"></div>
        <div className="robot-indicator bottom-6 right-10 animate-blink delay-1000"></div>
        
        {/* Circuit paths */}
        <div className="circuit-path top-10 left-8 w-[80%]"></div>
        <div className="circuit-path bottom-14 left-12 w-[60%]"></div>
        
        {/* Title with glitch effect */}
        <h2 className="text-2xl font-bold text-[#1967D2] mb-3 robot-text animate-glitch duration-2000 text-center">
          {title}
        </h2>
        
        {/* Loading animation container - centered */}
        <div className="mb-5 flex justify-center items-center">
          <div className="w-24 h-24 border-4 border-[#E8F0FE] rounded-lg flex items-center justify-center animate-holo">
            <div className="w-16 h-16 bg-[#E8F0FE] rounded"></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full progress-bar rounded-full mb-4 overflow-hidden">
          {/* The progress bar is now animated with CSS */}
        </div>
        
        {/* Loading step */}
        <div className="text-center mb-3">
          <p className="text-[#1967D2] robot-text animate-soft-pulse">
            {loadingSteps[currentStep]}
          </p>
        </div>
        
        {/* Subtitle */}
        <p className="text-sm text-[#5F6368] text-center robot-text">
          {subtitle}
        </p>
        
        {/* Loading percentage */}
        <div className="absolute bottom-2 right-2 text-xs text-[#1967D2] robot-text animate-soft-pulse">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default RobotLoader; 