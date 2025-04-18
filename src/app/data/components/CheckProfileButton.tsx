import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const CheckProfileButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const { user } = useAuth();
  const supabase = createBrowserClient();
  
  // Add this function to check schema
  const checkSchema = async () => {
    setIsLoading(true);
    try {
      // This query will get column information for the plans table
      const { data, error } = await supabase.rpc(
        'get_table_columns',
        { table_name: 'plans' }
      );
      
      if (error) {
        // If the stored procedure doesn't exist, try a direct query
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_name', 'plans')
          .eq('table_schema', 'public');
          
        if (columnsError) throw columnsError;
        setSchemaInfo(columns);
      } else {
        setSchemaInfo(data);
      }
    } catch (error) {
      console.error('Error checking schema:', error);
      setSchemaInfo({ error: 'Failed to check schema' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex space-x-2 flex-wrap">
        <button
          onClick={checkSchema}
          disabled={isLoading}
          className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded text-xs transition-colors disabled:opacity-50 mb-1"
        >
          {isLoading ? 'Loading...' : 'Check DB Schema'}
        </button>
      </div>
      
      {schemaInfo && (
        <div className="mt-2 bg-gray-200 p-2 rounded text-xs overflow-auto max-h-40">
          <h4 className="font-semibold mb-1">Plans Table Schema:</h4>
          <pre>{JSON.stringify(schemaInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default CheckProfileButton; 