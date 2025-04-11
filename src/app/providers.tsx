'use client';

import { ReactNode } from 'react';
import { SupabaseProvider } from '@/lib/supabase/client-provider';
import { AuthProvider } from '@/lib/auth/auth-context';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SupabaseProvider>
  );
} 