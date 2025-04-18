/**
 * Mock migration script to demonstrate the migration process
 * without requiring a real Supabase connection
 */

// Sample profiles data (simulating what we'd get from the database)
const mockProfiles = [
  {
    id: 'user-123',
    email: 'user1@example.com',
    plan: { 
      name: 'Growth', 
      impressions_limit: 50000
    }
  },
  {
    id: 'user-456',
    email: 'user2@example.com',
    plan: { 
      name: 'Starter', 
      impressions_limit: 10000
    }
  },
  {
    id: 'user-789',
    email: 'user3@example.com',
    plan: 'Enterprise' // Already a string
  },
  {
    id: 'user-abc',
    email: 'user4@example.com',
    plan: null // No plan
  }
];

async function mockMigratePlansToStrings() {
  console.log('Starting mock plan migration...');
  
  console.log(`Found ${mockProfiles.length} profiles to check`);
  let updateCount = 0;
  
  // Process each profile
  for (const profile of mockProfiles) {
    console.log(`\nChecking profile ${profile.id} (${profile.email})`);
    console.log(`Current plan data: ${JSON.stringify(profile.plan)}`);
    
    if (typeof profile.plan === 'object' && profile.plan !== null) {
      // Extract plan name from object
      const planName = profile.plan.name || 'Starter';
      
      // In a real migration, this would update the database
      console.log(`WOULD UPDATE: profile ${profile.id} plan from object to string: "${planName}"`);
      
      // Simulate the update in our mock data
      profile.plan = planName;
      
      updateCount++;
    } else {
      console.log(`No update needed for profile ${profile.id}`);
    }
  }
  
  console.log('\n=== MIGRATION SUMMARY ===');
  console.log(`Updated ${updateCount} profiles.`);
  console.log('\n=== FINAL PROFILE DATA ===');
  mockProfiles.forEach(profile => {
    console.log(`${profile.id} (${profile.email}): Plan = ${JSON.stringify(profile.plan)}`);
  });
}

// Run the mock migration
mockMigratePlansToStrings().catch(console.error); 