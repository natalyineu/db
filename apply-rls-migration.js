// Script to apply RLS migration to Supabase
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log('Connecting to Supabase...');
  
  try {
    // Read migration file
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'src/migrations/supabase-rls-fix.sql'), 'utf8');
    
    // Execute the migration
    console.log('Applying migration...');
    
    // Split the SQL into separate statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement separately
    for (const stmt of statements) {
      if (!stmt.trim()) continue;
      
      console.log(`Executing: ${stmt.slice(0, 50)}...`);
      const { error } = await supabase.rpc('postgres_execute', { statement: stmt.trim() });
      
      if (error) {
        // If postgres_execute isn't available, try direct SQL execution (needs newer Supabase version)
        try {
          const { error: sqlError } = await supabase.sql(stmt.trim());
          if (sqlError) {
            console.error('Error applying SQL statement:', sqlError);
          }
        } catch (sqlErr) {
          console.error('Alternative SQL execution failed:', sqlErr);
          console.warn('You may need to manually run these migrations in the Supabase SQL editor');
        }
      }
    }
    
    console.log('Migration attempted. Check your Supabase dashboard to verify.');
    console.log('Migration SQL is saved in src/migrations/supabase-rls-fix.sql if you need to run it manually.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main(); 