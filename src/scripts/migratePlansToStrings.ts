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

async function migratePlansToStrings() {
  console.log('Starting plan migration...');
  
  // Fetch all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles to check`);
  let updateCount = 0;
  
  // Process each profile
  for (const profile of profiles) {
    if (typeof profile.plan === 'object' && profile.plan !== null) {
      // Extract plan name from object
      const planName = profile.plan.name || 'Starter';
      
      // Update profile with string plan
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: planName })
        .eq('id', profile.id);
        
      if (updateError) {
        console.error(`Error updating profile ${profile.id}:`, updateError);
      } else {
        updateCount++;
        console.log(`Updated profile ${profile.id} plan from object to string: "${planName}"`);
      }
    }
  }
  
  console.log(`Migration complete. Updated ${updateCount} profiles.`);
}

// Run the migration
migratePlansToStrings().catch(console.error); 