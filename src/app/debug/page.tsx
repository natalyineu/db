'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/client-provider';
import Link from 'next/link';

export default function DebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<string[]>([]);
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({});
  const supabase = useSupabase();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get session
        const { data, error } = await supabase.auth.getSession();
        setSessionInfo({ 
          session: data.session ? {
            ...data.session,
            access_token: data.session.access_token ? `${data.session.access_token.substring(0, 10)}...` : null,
            refresh_token: data.session.refresh_token ? `${data.session.refresh_token.substring(0, 10)}...` : null,
          } : null, 
          error: error ? error.message : null 
        });
        
        // Check cookies
        document.cookie.split(';').forEach(cookie => {
          const trimmed = cookie.trim();
          setCookies(prev => [...prev, trimmed]);
        });
        
        // Check local storage
        const storageItems: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            let value = window.localStorage.getItem(key) || '';
            // Truncate long values
            if (value.length > 50) {
              value = value.substring(0, 50) + '...';
            }
            storageItems[key] = value;
          }
        }
        setLocalStorage(storageItems);
      } catch (error) {
        console.error('Debug page error:', error);
        setSessionInfo({ session: null, error: String(error) });
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [supabase]);
  
  const handleForceRefresh = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      alert(`Session refresh: ${error ? 'Failed - ' + error.message : 'Success'}`);
      window.location.reload();
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <div className="text-sm">
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-80">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <ul className="list-disc pl-5">
          {cookies.map((cookie, i) => (
            <li key={i} className="mb-1">{cookie}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Local Storage</h2>
        <ul className="list-disc pl-5">
          {Object.entries(localStorage).map(([key, value]) => (
            <li key={key} className="mb-1">
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={handleForceRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Force Session Refresh
        </button>
        
        <Link href="/login" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Go to Login
        </Link>
        
        <Link href="/data" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Try Access Data
        </Link>
      </div>
    </div>
  );
} 