/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * The campaign-related hooks are deprecated and replaced with brief hooks.
 */

// Re-export legacy hooks with a deprecation notice
export { default as useBriefs } from '@/hooks/useBriefs';

export { useCampaignListState } from './useCampaignListState';
export { useCampaigns } from './useCampaigns'; 