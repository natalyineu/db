import React, { useState } from 'react';
import { BriefDisplay, BriefHeader, DeleteConfirmationDialog } from './';
import BriefForm from './BriefForm';
import { BriefFormData, FormErrors } from '../hooks/types';

interface BriefSectionProps {
  brief: any;
  isEditing: boolean;
  formData: {
    platforms: string[];
    target_audience: string;
    location: string;
    start_date: string;
    end_date: string;
    type: string;
    description: string;
    consent: boolean;
    business_name?: string;
  };
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const BriefSection: React.FC<BriefSectionProps> = ({
  brief,
  isEditing,
  formData,
  formErrors,
  isSubmitting,
  onEdit,
  onDelete,
  handleChange,
  handleCheckboxChange,
  handleSubmit
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Validate brief before actions
  const isBriefValid = brief && typeof brief === 'object' && brief.id;
  
  const handleConfirmDelete = async () => {
    if (isDeleting || !isBriefValid) return; // Prevent deletion if invalid brief
    
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEdit = () => {
    if (!isBriefValid) {
      console.error("Cannot edit: Invalid brief object");
      return;
    }
    onEdit();
  };
  
  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-5 sm:mb-8 overflow-hidden glass">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full translate-x-20 -translate-y-20 opacity-25"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 rounded-full -translate-x-16 translate-y-16 opacity-20"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 sm:mb-6">
          <BriefHeader 
            existingBrief={brief}
            isEditing={isEditing}
            onEdit={handleEdit}
            onDelete={() => {
              if (!isBriefValid) {
                console.error("Cannot delete: No brief exists or invalid brief", brief);
                return;
              }
              setShowDeleteConfirmation(true);
            }}
          />
          
          {brief && !isEditing && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <BriefDisplay brief={brief} />
            </div>
          )}
        </div>
        
        {showDeleteConfirmation && (
          <DeleteConfirmationDialog
            isOpen={showDeleteConfirmation}
            onCancel={() => setShowDeleteConfirmation(false)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
          />
        )}

        {/* Show BriefForm if no brief exists or if editing */}
        {(brief === null || isEditing) && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg blur-md opacity-25"></div>
            <BriefForm 
              formData={formData}
              formErrors={formErrors}
              handleChange={handleChange}
              handleCheckboxChange={handleCheckboxChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting || isDeleting}
              currentDate={new Date().toISOString().split('T')[0]}
              defaultEndDate={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>
      
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-indigo-200 rounded-tl-md"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-200 rounded-tr-md"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-200 rounded-bl-md"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-indigo-200 rounded-br-md"></div>
    </div>
  );
};

export default BriefSection; 