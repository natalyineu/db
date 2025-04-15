'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function AuthLinks() {
  const { isAuthenticated } = useAuth();
  
  // Don't show auth links if the user is authenticated (UserMenu will be shown instead)
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <Link 
        href="/login"
        className="hidden md:inline-flex text-gray-700 hover:text-gray-900 text-sm font-medium"
      >
        Sign in
      </Link>
      
      <Link 
        href="/register"
        className="text-sm px-3 md:px-4 py-2 rounded-full ai-vertise-gradient-bg text-white hover:opacity-90 transition-opacity inline-flex items-center"
      >
        <span className="hidden md:inline">Get Started</span>
        <span className="md:hidden">Sign Up</span>
        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </>
  );
} 