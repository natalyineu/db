'use client';

import React from 'react';

export default function DataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: '#F7F2F9' }}>
      {children}
    </div>
  );
} 