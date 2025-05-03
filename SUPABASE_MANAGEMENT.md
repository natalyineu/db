# Managing Your Application Through Supabase UI

Since the admin panel is not active, you can manage your application directly through the Supabase UI. This guide explains how to perform common tasks.

## Managing Plans

To manage subscription plans:

1. Log in to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to the "Table Editor" in the left sidebar
4. Select the "plans" table

### Viewing Plans
- All your plans will be visible in the table view
- You can sort and filter using the UI controls

### Creating a New Plan
1. Click the "Insert Row" button
2. Fill in the plan details:
   - `name`: Plan name (e.g., "Starter", "Professional", "Enterprise")
   - `description`: Description of the plan features
   - `price`: The price in dollars (numeric value)
   - `impressions_limit`: The number of impressions allowed
   - `features`: JSON object containing the plan features (e.g., `{"featureA": true, "featureB": false}`)
3. Click "Save"

### Editing a Plan
1. Find the plan you want to edit in the table
2. Click on the row or use the "Edit" option
3. Modify any field values
4. Click "Save"

### Deleting a Plan
1. Find the plan you want to delete
2. Click the three dots menu (...)
3. Select "Delete row"
4. Confirm the deletion

## Managing Users

To manage users and their plans:

1. Go to the "Table Editor" and select the "profiles" table
2. Find the user you want to modify
3. To change a user's plan, edit the `plan` column with JSON data like this:
   ```json
   {
     "name": "Professional",
     "impressions_limit": 50000,
     "payment_status": "active",
     "renewal_date": "2023-05-18T00:00:00.000Z"
   }
   ```
4. Click "Save"

## Managing Campaigns

1. Go to the "Table Editor" and select the "campaigns" table
2. You can view, create, edit, or delete campaigns directly

## Important Tables

- `plans`: Subscription plans
- `profiles`: User profiles with subscription data
- `campaigns`: Marketing campaigns

## Data Types for Plans

The plans table has the following structure:
- `id`: Integer (auto-generated)
- `created_at`: Timestamp
- `updated_at`: Timestamp 
- `name`: String (required)
- `description`: String
- `price`: Numeric
- `impressions_limit`: Integer (required)
- `features`: JSON object

Remember to refresh your application after making changes to see them reflected in the UI.

## RLS Policies Fix

If you're experiencing issues with Row Level Security policies in your Supabase project, you need to apply the RLS migration. There are two ways to do this:

### Option 1: Using the Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `src/migrations/supabase-rls-fix.sql` into the editor
5. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push
```

This will apply all migrations to your project.

## Common Errors

### New row violates row-level security policy for table "profiles"

This error occurs when Row Level Security policies prevent inserting new profiles. To fix this, apply the RLS migration which sets proper security policies for both profiles and briefs tables.

### Error fetching campaigns: {}

This usually happens when:
1. Row Level Security policies are not properly set up for the briefs table
2. You're trying to query the wrong table (campaigns vs briefs)

The fixes in the RLS migration should address both of these issues. 