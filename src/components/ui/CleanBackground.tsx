'use client';

import React, { ReactNode } from 'react';

interface CleanBackgroundProps {
  children: ReactNode;
  className?: string;
}

/**
 * A component that ensures a clean, pattern-free background
 * Use this to wrap content that needs a clean background
 */
const CleanBackground: React.FC<CleanBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div 
      className={`${className}`} 
      style={{ 
        background: '#F7F2F9',
        backgroundImage: 'none',
        position: 'relative',
        zIndex: 1
      }}
    >
      {children}
    </div>
  );
};

export default CleanBackground; 