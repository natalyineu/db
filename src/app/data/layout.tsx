'use client';

import React from 'react';

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white" style={{ background: 'white' }}>
      {children}
    </div>
  );
} 