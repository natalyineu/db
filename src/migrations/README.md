# Database Migration Files

This directory contains SQL migration files that have been used to set up and modify the database schema in Supabase.

These files are kept for reference purposes only and should not be re-run unless setting up a new environment.

## Migration Files

- **supabase-campaigns-migration.sql**: Creates and configures the campaigns and assets tables.
- **supabase-profiles-plan-migration.sql**: Updates the profile schema to include plan information.
- **supabase-kpi-table.sql**: Creates the KPI metrics table and related functions.
- **supabase-kpi-table-update.sql**: Updates to the KPI table structure after initial deployment.

## Metrics Tracked

The system tracks the following key performance indicators (KPIs) for each campaign:

| Metric | Description | Fields |
|--------|-------------|--------|
| **Budget** | Financial allocation and spending | `budget_plan`, `budget_fact`, `budget_percentage` |
| **Impressions** | Number of times content is displayed | `impressions_plan`, `impressions_fact`, `impressions_percentage` |
| **Clicks** | User interactions with content | `clicks_plan`, `clicks_fact`, `clicks_percentage` |
| **Reach** | Unique users reached | `reach_plan`, `reach_fact`, `reach_percentage` |

For more detailed documentation about the metrics system, see [docs/metrics-mapping.md](/docs/metrics-mapping.md). 