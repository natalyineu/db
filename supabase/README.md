# Supabase Project Configuration

This directory contains configurations and database functions for the Supabase backend.

## Migrations

Database migrations are stored in the `/migrations` directory:

- `20240418_admin_utils.sql`: Contains admin utility functions including:
  - `set_admin_role`: Sets a user's role to admin
  - `get_table_info`: Gets schema information for a table

## Functions

Custom Supabase functions are stored in the `/functions` directory.

## Important Database Tables

- `profiles`: User profile information
- `plans`: Subscription plans
- `campaigns`: Marketing campaigns

## Manual Database Setup

If you need to set an admin user manually, run the following SQL in the Supabase SQL editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"')
WHERE email = 'your-email@example.com';
```

## Admin Utility Pages

The application includes admin utility pages:

- `/admin/setadmin`: Set your account as admin
- `/admin/debug`: Database debugging tool
- `/admin/profile`: Admin profile management
- `/admin/users`: User management
- `/admin/plans`: Plan management
- `/admin/campaigns`: Campaign management 