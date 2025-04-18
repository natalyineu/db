import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found');
  dotenv.config();
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log(`Using Supabase URL: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function directPlanUpdate() {
  console.log('Starting direct plan update...');

  // This will run an RPC function executing SQL to update all plans at once
  // If your Supabase instance doesn't allow RPC function calls for SQL, you'll need to do this 
  // directly in the Supabase SQL editor instead
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_string: `
        UPDATE profiles
        SET plan = to_jsonb(plan->>'name')
        WHERE 
          plan IS NOT NULL 
          AND (jsonb_typeof(plan) = 'object')
          AND plan->>'name' IS NOT NULL;
      `
    });
    
    if (error) {
      console.error("Error executing SQL:", error);
      console.log("\nAlternative: Please run the SQL directly in your Supabase SQL editor:");
      console.log(`
        UPDATE profiles
        SET plan = to_jsonb(plan->>'name')
        WHERE 
          plan IS NOT NULL 
          AND (jsonb_typeof(plan) = 'object')
          AND plan->>'name' IS NOT NULL;
      `);
      return;
    }
    
    console.log("Update completed successfully");
    console.log(data);
    
  } catch (error) {
    console.error("Error:", error);
    console.log("\nPlease run the SQL directly in your Supabase SQL editor:");
    console.log(`
      UPDATE profiles
      SET plan = to_jsonb(plan->>'name')
      WHERE 
        plan IS NOT NULL 
        AND (jsonb_typeof(plan) = 'object')
        AND plan->>'name' IS NOT NULL;
    `);
  }
}

// Run the update
directPlanUpdate().catch(console.error); 