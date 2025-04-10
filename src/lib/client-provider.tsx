'use client';

import { createBrowserClient } from '@/lib/supabase';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a context for the Supabase client
type SupabaseContext = {
  supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

// Provider component to wrap the app with
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Initialize the client in useEffect to ensure it's created client-side
      const client = createBrowserClient();
      setSupabase(client);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      setError(err instanceof Error ? err : new Error('Unknown error creating Supabase client'));
    }
  }, []);

  // Show error UI if client creation failed
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <h2 className="font-bold">Error initializing app</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  // Don't render children until client is ready
  if (!supabase) {
    return <div className="p-4">Loading...</div>;
  }

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