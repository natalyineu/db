# Refactoring to Standardize Terminology

## Overview

This project has been refactored to standardize on consistent terminology throughout the codebase. Specifically, we have adopted "Brief" as the standard term for what was previously inconsistently referred to as both "Brief" and "Campaign".

## Motivation

The refactoring was done for the following reasons:

1. **Database Consistency**: Our Supabase database uses a table called "briefs" to store this data
2. **Reduced Cognitive Load**: Having two terms for the same concept created unnecessary complexity
3. **Simpler Code Maintenance**: Consistent naming patterns make the codebase easier to understand and maintain
4. **Reduced Duplication**: We had duplicate services, hooks, and components that did essentially the same thing

## Changes Made

### 1. Types Standardization

- Updated `src/types/index.ts` to clearly document that "Brief" is the standard term
- Deprecated the Campaign aliases but kept them for backward compatibility

### 2. Services Consolidation

- Removed redundant `campaign-service.ts` file
- Updated `brief-service.ts` to be the single source of truth for Supabase operations
- Updated service exports in `services/index.ts`

### 3. Hooks Consolidation

- Created a new unified `useBriefs` hook that combines CRUD operations and list functionality
- Re-exported the hook from the campaigns feature directory for backward compatibility
- Deprecated the old hooks

### 4. Component Renames

- Renamed `CampaignList` to `BriefList`
- Renamed `CampaignItem` to `BriefItem`
- Renamed `CampaignMetrics` to `BriefMetrics`
- Renamed `CreateCampaignButton` to `CreateBriefButton`
- Updated component exports in the UI index

## Feature Usage

The new standardized hooks and components can be used as follows:

```tsx
// Using the unified hook
import { useBriefs } from '@/hooks/useBriefs';

function MyComponent() {
  const {
    briefs,
    isLoading,
    error,
    paginatedBriefs,
    page,
    totalPages,
    sortField,
    sortDirection,
    handlePageChange,
    handleSortChange,
    createBrief,
    updateBrief,
    deleteBrief,
    selectBrief
  } = useBriefs();
  
  // ... rest of the component
}

// Using the BriefList component
import { BriefList } from '@/components/ui';

function MyListComponent({ briefs }) {
  return (
    <BriefList
      briefs={briefs}
      isLoading={false}
      onSelect={handleSelect}
      onDelete={handleDelete}
    />
  );
}
```

## Legacy Support

For backward compatibility, we've maintained the following:

1. Type aliases in `src/types/index.ts` to avoid breaking existing code
2. Re-exports of the new hooks from the old locations
3. The Campaign name in UI elements when necessary for consistency with existing screens

## Future Improvements

In the future, we should:

1. Remove the Campaign type aliases once all code is migrated to use Brief
2. Update any UI text that still uses "Campaign" instead of "Brief"
3. Update database column names that might still use campaign_id instead of brief_id 