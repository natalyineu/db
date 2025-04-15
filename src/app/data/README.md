# Database Migrations

This directory contains Supabase SQL migration files for the AI-Vertise platform.

## Required Migrations

### Add Location Field to Campaigns Table

The file `supabase-campaigns-migration.sql` adds a `location` column to the `campaigns` table if it doesn't already exist. 

To apply this migration:

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `supabase-campaigns-migration.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

This migration is safe to run multiple times as it checks if the column exists before attempting to add it.

## KPI Table

The KPI table schema can be found in `kpi/supabase-kpi-table.sql`. This table stores performance metrics for campaigns.

## Troubleshooting

If you encounter errors on the KPI page, please ensure:
1. The campaigns table has the required location column
2. At least one campaign exists in the database
3. The KPI table is correctly set up with proper foreign key references 