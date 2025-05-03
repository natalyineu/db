// Simple script to test Supabase configuration
require('dotenv').config({ path: '.env.local' });

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
  'Key exists (first 8 chars): ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 8) + '...' : 
  'Key is missing'
); 