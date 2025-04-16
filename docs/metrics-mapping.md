# Metrics Tracking System Documentation

## Core Metrics Overview

The application tracks four key performance indicators (KPIs) for each campaign:

| Metric | Description | Use Case |
|--------|-------------|----------|
| **Budget** | Financial allocation and spending | Track campaign expenditure against planned budget |
| **Impressions** | Number of times content is displayed | Measure content visibility and campaign reach |
| **Clicks** | User interactions with content | Track engagement with campaign assets |
| **Reach** | Unique users reached | Measure campaign audience size |

## Database Schema

Each metric follows a consistent pattern with three components stored in the Supabase `kpi` table:

| Component | Suffix | Example | Description |
|-----------|--------|---------|-------------|
| Plan | `_plan` | `budget_plan` | Target value (goal to achieve) |
| Fact | `_fact` | `budget_fact` | Actual value (what was achieved) |
| Percentage | `_percentage` | `budget_percentage` | Performance calculation (fact/plan × 100) |

### Complete Field Mapping

| UI Display | Supabase Field | Table | Description |
|------------|----------------|-------|-------------|
| Budget (Plan) | `budget_plan` | `kpi` | Planned budget allocation |
| Budget (Actual) | `budget_fact` | `kpi` | Actual amount spent |
| Budget (%) | `budget_percentage` | `kpi` | Percentage of budget utilized |
| Impressions (Plan) | `impressions_plan` | `kpi` | Target number of impressions |
| Impressions (Actual) | `impressions_fact` | `kpi` | Actual impressions achieved |
| Impressions (%) | `impressions_percentage` | `kpi` | Percentage of impression target achieved |
| Clicks (Plan) | `clicks_plan` | `kpi` | Target number of clicks |
| Clicks (Actual) | `clicks_fact` | `kpi` | Actual clicks achieved |
| Clicks (%) | `clicks_percentage` | `kpi` | Percentage of click target achieved |
| Reach (Plan) | `reach_plan` | `kpi` | Target unique audience size |
| Reach (Actual) | `reach_fact` | `kpi` | Actual unique audience reached |
| Reach (%) | `reach_percentage` | `kpi` | Percentage of reach target achieved |

## Frontend Integration

### Dashboard Components

| Component | Purpose | Metrics Used |
|-----------|---------|--------------|
| `MetricsCards.tsx` | Displays summary metric cards | All metrics (plan, fact, percentage) |
| `KpiSummary.tsx` | Shows overall KPI performance | All metrics with percentage focus |
| `ChartSection.tsx` | Visualizes metric trends over time | Historical metric data |

### Data Flow

1. `kpi-service.ts` retrieves metric data from Supabase
2. The service transforms raw database fields into `MetricData` objects:
   ```typescript
   interface MetricData {
     plan: number;
     fact: number;
     percentage: number;
   }
   ```
3. `KpiDashboardContainer.tsx` coordinates data display
4. Individual metric components render the specific KPI values

## Form and Input

The `AddKpiForm.tsx` component allows users to:
- Input planned and actual values for each metric
- The percentage is calculated automatically (fact/plan × 100)
- Data is validated before being sent to Supabase

## Related Tables

The metrics are linked to other entities in the database:

- **campaigns**: Main campaign information
  - Primary fields: `id`, `name`, `status`, `type`, `user_id`, `budget`
  - Related to KPIs via `campaign_id` foreign key

- **assets**: Campaign creative assets
  - Primary fields: `id`, `campaign_id`, `url`, `drive_link`, `notes`
  - Indirectly related to KPIs through campaigns

## User Plan Limitations

User profiles contain plan limitations that affect metrics:
- `impressions_limit`: Maximum impressions allowed under the user's plan
- This affects validation and warnings in the metrics interface 