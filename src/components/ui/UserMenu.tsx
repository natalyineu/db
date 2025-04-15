'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // If not authenticated, don't show the menu
  if (!isAuthenticated) {
    return null;
  }
  
  // Get display name (use first part of email if no profile name)
  const displayName = profile?.first_name || user?.email?.split('@')[0] || 'User';
  const initial = (profile?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {initial}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            
            <Link
              href="/data"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 