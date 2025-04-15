'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };
  
  return (
    <button
      onClick={handleToggle}
      className={`
        p-2 rounded-full transition-all duration-300 
        relative overflow-hidden
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${theme === 'dark' 
          ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
          : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'
        }
        focus:outline-none glass-hover
      `}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      
      <div className={`
        absolute inset-0 rounded-full transition-opacity duration-300 
        ${theme === 'dark'
          ? 'opacity-20 bg-gradient-to-tr from-yellow-200 to-yellow-400'
          : 'opacity-20 bg-gradient-to-tr from-indigo-300 to-indigo-500'
        }
      `} />
      
      <div className={`
        relative z-10 transition-all duration-300
        ${isAnimating ? 'rotate-180' : 'rotate-0'}
      `}>
        {theme === 'dark' ? (
          // Sun icon - more detailed and modern
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" 
              fill="currentColor"
            />
            <path 
              d="M12 1V3M12 21V23M23 12H21M3 12H1M20.485 3.515L19.071 4.929M4.929 19.071L3.515 20.485M20.485 20.485L19.071 19.071M4.929 4.929L3.515 3.515" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Moon icon - more detailed and modern
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M9.38111 2.38257C9.91687 2.92192 9.93547 3.78937 9.41933 4.34939C8.45015 5.39839 7.88587 6.83429 7.88587 8.41143C7.88587 11.7619 10.5995 14.4756 13.95 14.4756C15.5309 14.4756 16.9698 13.9083 18.0202 12.9348C18.5796 12.4175 19.4465 12.4346 19.9862 12.9708C20.5283 13.5095 20.5112 14.3805 19.953 14.9052C18.3172 16.4146 16.1641 17.3586 13.7909 17.3586C8.95107 17.3586 5.00286 13.4582 5.00286 8.67339C5.00286 6.30528 5.9441 4.15692 7.44811 2.52813C7.97322 1.96932 8.8446 1.9423 9.38111 2.38257Z" 
              fill="currentColor"
            />
          </svg>
        )}
      </div>
      
      {/* Ring animation */}
      <div className={`
        absolute inset-0 rounded-full
        ${isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-0'} 
        transition-all duration-500
        ${theme === 'dark' ? 'bg-yellow-300' : 'bg-indigo-500'}
      `} />
    </button>
  );
};

export default ThemeToggle; 