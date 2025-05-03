'use client';

import { createBrowserClient } from './client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a context for the Supabase client
type SupabaseContext = {
  supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

// Provider component to wrap the app with
export function SupabaseProvider({ children }: { children: ReactNode }) {
  // Get the singleton client instance
  const supabase = createBrowserClient();

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

// Hook to use the Supabase client
export function useSupabase() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
} 