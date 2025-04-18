'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function AdminDebugPage() {
  const [dbStatus, setDbStatus] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);
  
  const supabase = createBrowserClient();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      checkDatabaseAccess();
      getUserDetails();
    }
  }, [isAuthenticated]);
  
  const getUserDetails = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      setUserDetails(data.user);
    } catch (error) {
      console.error('Error getting user details:', error);
    }
  };
  
  const checkDatabaseAccess = async () => {
    setLoading(true);
    const tables = ['profiles', 'plans', 'campaigns'];
    const results: {[key: string]: any} = {};
    
    for (const table of tables) {
      try {
        // Try to count records
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          results[table] = { 
            status: 'error', 
            message: countError.message,
            details: countError.details,
            hint: countError.hint
          };
          continue;
        }
        
        // Try to get schema info
        const { data: schemaData, error: schemaError } = await supabase
          .rpc('get_table_info', { table_name: table });
        
        results[table] = { 
          status: 'success', 
          count, 
          schema: schemaError ? 'Error getting schema' : schemaData
        };
      } catch (error) {
        console.error(`Error checking ${table}:`, error);
        results[table] = { status: 'error', message: 'Exception occurred' };
      }
    }
    
    setDbStatus(results);
    setLoading(false);
  };
  
  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please log in first</div>;
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Debugging</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <pre className="bg-white p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(userDetails, null, 2)}
        </pre>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Admin Access</h3>
          <p>Admin Role: {userDetails?.app_metadata?.role === 'admin' ? 'Yes ✅' : 'No ❌'}</p>
          {userDetails?.app_metadata?.role !== 'admin' && (
            <div className="mt-2 p-2 bg-yellow-100 rounded">
              <p>To set admin role, go to <a href="/admin/setadmin" className="text-blue-600 underline">Admin Setup</a></p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Database Access Check</h2>
        <button
          onClick={checkDatabaseAccess}
          className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4"
        >
          Refresh Database Status
        </button>
        
        {loading ? (
          <p>Loading database status...</p>
        ) : (
          <div className="grid gap-4">
            {Object.entries(dbStatus).map(([table, status]) => (
              <div key={table} className="p-4 bg-white shadow rounded-md">
                <h3 className="text-lg font-semibold border-b pb-2 mb-2">
                  Table: {table}
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    status.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {status.status}
                  </span>
                </h3>
                
                {status.status === 'success' ? (
                  <div>
                    <p className="mb-2">Records: {status.count}</p>
                    {status.schema && (
                      <div className="mt-2">
                        <p className="font-medium mb-1">Schema Info:</p>
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(status.schema, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="mb-1">Error: {status.message}</p>
                    {status.details && <p className="text-sm">Details: {status.details}</p>}
                    {status.hint && <p className="text-sm">Hint: {status.hint}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md">
        <h3 className="font-semibold mb-2">Troubleshooting Steps</h3>
        <ol className="list-decimal pl-4 space-y-2">
          <li>Verify you have admin role (check User Info section)</li>
          <li>Make sure database tables exist and have correct permissions</li>
          <li>Check the browser console for network errors</li>
          <li>Try logging out and logging back in</li>
          <li>Ensure Supabase functions are deployed properly</li>
        </ol>
      </div>
    </div>
  );
} 