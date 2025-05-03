'use client';

import { ReactNode } from 'react';
import { SupabaseProvider } from '@/lib/supabase/client-provider';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import { ThemeProvider } from '@/lib/ThemeContext';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
} 