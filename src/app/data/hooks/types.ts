// Types and interfaces for brief form functionality

// Define the interface for the form data
export interface BriefFormData {
  businessName: string;
  targetAudience: string;
  additionalNotes: string;
  landingPageUrl: string;
  creativesLink: string;
  location: string;
  consent: boolean;
  start_date: string;
  end_date: string;
}

// Interface for form errors
export interface FormErrors {
  [key: string]: string | undefined;
}

// Add a separate interface for the submission data structure
// Updated to match exactly what the campaigns table accepts
export interface SubmissionData {
  user_id: string;
  name: string;
  status: string;
  type: string;
  budget: number;
  start_date?: string;
  end_date?: string;
  
  // Optional fields that might be accepted
  description?: string;
  target_audience?: string;
  platforms?: string[];
  location?: string;
}

// Interface for the result of the useBriefForm hook
export interface UseBriefFormResult {
  formData: BriefFormData;
  formErrors: FormErrors;
  isSubmitting: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setBrief: (brief: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEditBrief: () => void;
  handleDeleteBrief: () => Promise<void>;
}

// Brief status type
export type BriefStatus = 'No' | 'In Progress' | 'Yes';

// Profile plan type
export interface ProfilePlan {
  name?: string;
  id?: string;
  impressions_limit?: number;
} 