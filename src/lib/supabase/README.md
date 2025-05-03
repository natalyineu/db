# Supabase Module

This module provides a centralized way to interact with Supabase in the application.

## Structure

- `index.ts` - Main entry point, exports everything needed from this module
- `client.ts` - Core client implementations (browser, server, admin)
- `client-provider.tsx` - React provider for Supabase context
- `utils.ts` - Helper functions and utilities

## Usage

### In Client Components

```tsx
import { useSupabase } from '@/lib/supabase';

function MyComponent() {
  const supabase = useSupabase();
  
  async function fetchData() {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');
      
    // Handle data...
  }
  
  return (
    // Component JSX...
  );
}
```

### In Hooks

```tsx
import { createBrowserClient, logDebug, logError } from '@/lib/supabase';

export function useMyHook() {
  const supabase = createBrowserClient(); // Returns singleton instance
  
  async function fetchData() {
    try {
      logDebug('Fetching data...');
      
      const { data, error } = await supabase
        .from('my_table')
        .select('*');
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      logError('Error fetching data', err);
      return null;
    }
  }
  
  return { fetchData };
}
```

### In Server Components/API Routes

```tsx
import { createServerClient, createAdminClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createServerClient();
  // Or for admin operations:
  // const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('my_table')
    .select('*');
    
  // Handle response...
}
```

## Best Practices

1. **Always import from the main entry point**:
   ```tsx
   // Do this:
   import { useSupabase } from '@/lib/supabase';
   
   // Not this:
   import { useSupabase } from '@/lib/supabase/client-provider';
   ```

2. **Use the singleton pattern**:
   The client implementation uses a singleton pattern to prevent creating multiple Supabase client instances. Always use the provided functions rather than creating your own clients.

3. **Keep sensitive operations server-side**:
   Never use the admin client in client-side code. The service role key has full access to your database.

4. **Use the logging utilities**:
   The `logDebug` and `logError` functions automatically handle environment-specific logging. 