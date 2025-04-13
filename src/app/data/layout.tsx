'use client';

import React from 'react';

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {children}
    </div>
  );
} 