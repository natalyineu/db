'use client';

import { ReactNode } from 'react';
import { SupabaseProvider } from '@/lib/supabase/client-provider';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  );
} 