"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { FormField, MessageDisplay } from '@/components/ui';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageState, setMessageState] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { signUp, error: authError, loadingState } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !email.includes('@')) {
      setMessageState({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    
    if (!password || password.length < 6) {
      setMessageState({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessageState({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    try {
      setMessageState(null);
      setIsSubmitting(true);
      
      // Use auth context to sign up
      const result = await signUp(email, password);
      
      setMessageState({ 
        type: 'success', 
        text: 'Registration successful! Please check your email to confirm your account.' 
      });
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Display user-friendly error message
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        // Handle specific error messages
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password is too weak. Please use a stronger password';
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

  // Prepare message for MessageDisplay component - use messageState as the source of truth
  const messageForDisplay = messageState?.text || authError || null;
  const messageType = messageState?.type || 'error';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Sign up with your email and password</p>
        </div>
        
        {messageForDisplay && (
          <MessageDisplay 
            type={messageType} 
            message={messageForDisplay} 
          />
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <FormField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(val) => setEmail(typeof val === 'string' ? val : val.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
            // Don't show individual field errors when there's a global success message
            error={messageState?.type === 'error' && messageState?.text.includes('email') ? messageState.text : undefined}
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(val) => setPassword(typeof val === 'string' ? val : val.target.value)}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            showTogglePassword
            helperText="Password must be at least 6 characters"
            // Don't show individual field errors when there's a global success message
            error={messageState?.type === 'error' && messageState?.text.includes('Password') ? messageState.text : undefined}
          />

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(val) => setConfirmPassword(typeof val === 'string' ? val : val.target.value)}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            showTogglePassword
            // Don't show individual field errors when there's a global success message
            error={messageState?.type === 'error' && messageState?.text.includes('match') ? messageState.text : undefined}
          />

          <div>
            <button
              type="submit"
              disabled={isSubmitting || loadingState.signUp}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ai-vertise-gradient-bg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loadingState.signUp ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </span>
              ) : 'Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
} 