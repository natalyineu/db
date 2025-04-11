export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  status?: string; // User account status
}

export type ErrorResponse = {
  code: string;
  message: string;
} 