"use client";

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase/client-provider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const supabase = useSupabase();
  const router = useRouter();

  const ensureUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch('/api/ensure-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error('Failed to ensure user profile:', await response.text());
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

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
      setIsSubmitting(true);
      setMessage(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Login successful, session:", data.session);

      // Create profile if needed
      if (data.session?.access_token) {
        try {
          await ensureUserProfile(data.session.access_token);

          console.log("Setting session manually");
          const sessionResult = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          console.log("Session set result:", sessionResult);

          // Helper function to check session status
          const checkSessionAndRedirect = async (attempts = 0) => {
            if (attempts > 5) {
              console.log("Too many attempts to verify session, redirecting anyway");
              router.push('/data');
              return;
            }

            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                console.log("Verified session exists, now redirecting");
                // Force a hard navigation to make sure all cookies are sent
                window.location.href = '/data';
              } else {
                console.log(`Session not detected, waiting longer... (attempt ${attempts + 1})`);
                // Try again after a short delay
                setTimeout(() => checkSessionAndRedirect(attempts + 1), 500);
              }
            } catch (err) {
              console.error("Error checking session:", err);
              setTimeout(() => checkSessionAndRedirect(attempts + 1), 500);
            }
          };

          // Wait a moment for the session to be properly set, then check
          console.log("Waiting for session to be properly set");
          setTimeout(() => checkSessionAndRedirect(), 300);
        } catch (loginError) {
          console.error("Error during login process:", loginError);
          setMessage({
            type: 'error',
            text: 'Error during login process. Please try again.'
          });
          setIsSubmitting(false);
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
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
