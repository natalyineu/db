// Export all type definitions from the profile module
export * from './profile';

/**
 * TERMINOLOGY STANDARDIZATION:
 * This codebase consistently uses "Brief" terminology.
 * All code uses the Brief-related types directly.
 */

export interface ErrorResponse {
  code: string;
  message: string;
} 

// Brief-related types - explicitly export these
export interface BriefAsset {
  id: string;
  brief_id: string;
  url: string;  // Required, default to google.com
  drive_link?: string;  // Optional Google Drive link
  notes?: string;  // Optional comments/notes
  created_at: string;
  updated_at?: string;
}

export type BriefStatus = 'draft' | 'active' | 'paused' | 'completed';

export type BriefType = 'awareness' | 'consideration' | 'conversion' | 'social' | 'email' | 'display' | 'search' | 'video';

export interface Brief {
  id: string;
  name: string;
  status: BriefStatus;
  type: BriefType;
  created_at: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
  user_id: string;
  assets?: BriefAsset[];
  
  // Additional properties for modern design
  budget: number;
  spent?: number;
  roas?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  description?: string;
  target_audience?: string;
  platforms?: string[];
  performance_score?: number;
} 