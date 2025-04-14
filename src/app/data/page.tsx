'use client';

import Dashboard from './dashboard';

// This is just a wrapper component to load the dashboard component
// We're maintaining this structure to keep backwards compatibility
export default function DataPage() {
  return <Dashboard />;
} 