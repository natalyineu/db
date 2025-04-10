"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Personal Account System</h1>
          <p className="mt-2 text-gray-600">Please log in or sign up to continue</p>
        </div>
        
        <div className="mt-8 space-y-3">
          <Link 
            href="/register" 
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </Link>
          
          <Link 
            href="/login" 
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log In
          </Link>
        </div>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            A simple personal account management system
          </p>
        </div>
      </div>
    </main>
  );
}
