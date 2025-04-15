"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { FormField, MessageDisplay } from '@/components/ui';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageState, setMessageState] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signIn, error: authError, isAuthenticated, loadingState } = useAuth();
  const router = useRouter();
  
  // If authenticated, redirect to data page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/data');
      // Reset submitting state when auth state changes
      setIsSubmitting(false);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessageState({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    if (!password) {
      setMessageState({ type: 'error', text: 'Please enter your password' });
      return;
    }

    try {
      setMessageState(null);
      setIsSubmitting(true);
      
      // Use the auth context sign in method
      await signIn(email, password);
      
      // Don't reset isSubmitting here - the useEffect will handle it
      // when isAuthenticated changes
    } catch (error) {
      if (DEBUG) {
        console.error('Login error:', error);
      }
      setMessageState({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      setIsSubmitting(false);
    }
  };

  // Prepare message for MessageDisplay component
  const messageForDisplay = messageState ? messageState.text : 
                          authError ? authError : null;
  const messageType = messageState?.type || 'error';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <MessageDisplay 
          type={messageType as any} 
          message={messageForDisplay} 
        />

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <FormField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(val) => setEmail(typeof val === 'string' ? val : val.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(val) => setPassword(typeof val === 'string' ? val : val.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            showTogglePassword
          />

          <div>
            <button
              type="submit"
              disabled={isSubmitting || loadingState.signIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting || loadingState.signIn ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-2 text-center text-sm">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
