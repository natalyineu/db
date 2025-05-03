"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FormField, MessageDisplay } from '@/components/ui';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageState, setMessageState] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signIn, error: authError, isAuthenticated, isLoading } = useAuth();
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
      
      // Display user-friendly error message
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes('credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('connection')) {
          errorMessage = 'Connection error. Please check your internet connection';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessageState({
        type: 'error',
        text: errorMessage
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
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Access your ad campaign dashboard</p>
        </div>

        <MessageDisplay 
          type={messageType as any} 
          message={messageForDisplay} 
        />

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          <FormField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(val) => setEmail(typeof val === 'string' ? val : val.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
            error={messageState?.text.includes('email') ? messageState.text : undefined}
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
            error={messageState?.text.includes('password') ? messageState.text : undefined}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ai-vertise-gradient-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-[#9333ea] hover:opacity-80">
              Sign up
            </Link>
          </p>
          <div className="text-center mt-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
            <p className="mt-2 text-gray-600">Access your brief dashboard</p>
          </div>
          <div className="mt-2 text-gray-500 text-xs">
            Sign in to manage your briefs, view analytics, and optimize your advertising performance.
          </div>
        </div>

        <div className="mt-3 text-center text-sm">
          <Link href="/" className="font-medium text-[#9333ea] hover:opacity-80">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
