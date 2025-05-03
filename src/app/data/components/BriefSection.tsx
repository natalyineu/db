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
    description: string;
    consent: boolean;
    name?: string;
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
    <div className="p-0 sm:p-0">
      <div className="px-6 sm:px-8 pb-6">
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
        {brief && !isEditing && <BriefDisplay brief={brief} />}
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
        <div className="px-6 sm:px-8 pb-6">
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
  );
};

export default BriefSection; 