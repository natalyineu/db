"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

// Only log in development
const DEBUG = process.env.NODE_ENV !== 'production';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signIn, error: authError, isAuthenticated } = useAuth();
  const router = useRouter();

  // If authenticated, redirect to data page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/data');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    try {
      setMessage(null);
      setIsSubmitting(true);
      
      // Use the auth context sign in method
      await signIn(email, password);
      
      // Reset submitting state immediately
      // Auth context will handle the redirect
      setIsSubmitting(false);
    } catch (error) {
      if (DEBUG) {
        console.error('Login error:', error);
      }
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      setIsSubmitting(false);
    }
  };

  // Display auth error from context if present
  const displayError = message || (authError ? { type: 'error', text: authError } : null);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {displayError && (
          <div className={`p-4 rounded-md ${displayError.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {displayError.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
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
