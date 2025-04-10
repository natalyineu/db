'use client';

import { ReactNode } from 'react';
import { SupabaseProvider } from '@/lib/client-provider';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  );
} 